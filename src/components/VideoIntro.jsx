import { useCallback, useEffect, useRef, useState } from "react";
import CameraConnectionErrorSolution from "./CameraConnectionErrorSolution.jsx";
import Alert from "./Alert.jsx";

const POLICY_CUT_MS = 2500;

export default function VideoIntro({ videoBlob, onVideoBlobChange, cameraEnabled = true }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const policyTimerRef = useRef(null);
  const forcePolicyStopRef = useRef(false);

  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [policyCutModalOpen, setPolicyCutModalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  /** Live camera preview in the stage (hidden after policy cut when camera is disabled). */
  const [livePreviewVisible, setLivePreviewVisible] = useState(true);

  const clearPolicyTimer = useCallback(() => {
    if (policyTimerRef.current) {
      clearTimeout(policyTimerRef.current);
      policyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!videoBlob?.size) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(videoBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoBlob]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
  }, []);

  useEffect(() => () => {
    clearPolicyTimer();
    stopStream();
  }, [clearPolicyTimer, stopStream]);

  useEffect(() => {
    if (!policyCutModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPolicyCutModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [policyCutModalOpen]);

  const stopRecording = useCallback(() => {
    clearPolicyTimer();
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, [clearPolicyTimer]);

  const startPreview = useCallback(async () => {
    setError("");
    clearPolicyTimer();
    stopStream();
    setLivePreviewVisible(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.error(e);
      setError("Could not access camera/microphone.");
    }
  }, [stopStream, clearPolicyTimer]);

  const startRecording = useCallback(async () => {
    setError("");
    chunksRef.current = [];
    clearPolicyTimer();
    forcePolicyStopRef.current = false;

    const stream = streamRef.current;
    if (!stream) {
      setError("Enable the camera first.");
      return;
    }

    const cameraDisabledByPolicy = cameraEnabled === false;

    try {
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "";
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = rec;

      rec.ondataavailable = (ev) => {
        if (ev.data?.size) chunksRef.current.push(ev.data);
      };
      rec.onerror = (ev) => {
        console.error(ev.error);
        clearPolicyTimer();
        setError("Recording failed. Try again or check camera permissions.");
      };

      rec.onstop = () => {
        clearPolicyTimer();
        if (forcePolicyStopRef.current) {
          forcePolicyStopRef.current = false;
          chunksRef.current = [];
          onVideoBlobChange?.(null);
          stopStream();
          setRecording(false);
          setLivePreviewVisible(false);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        onVideoBlobChange?.(blob);
        stopStream();
        setRecording(false);
      };

      rec.start(200);
      setRecording(true);

      if (cameraDisabledByPolicy) {
        policyTimerRef.current = setTimeout(() => {
          policyTimerRef.current = null;
          forcePolicyStopRef.current = true;
          const r = recorderRef.current;
          if (r && r.state === "recording") {
            r.stop();
          }
          setPolicyCutModalOpen(true);
        }, POLICY_CUT_MS);
      }
    } catch (e) {
      console.error(e);
      clearPolicyTimer();
      setError("Could not start recording. Try again or use another browser.");
    }
  }, [cameraEnabled, onVideoBlobChange, stopStream, clearPolicyTimer]);

  const clearVideo = useCallback(() => {
    clearPolicyTimer();
    forcePolicyStopRef.current = false;
    onVideoBlobChange?.(null);
    setPreviewUrl("");
    setLivePreviewVisible(true);
  }, [onVideoBlobChange, clearPolicyTimer]);

  const showRecordedPlayback = Boolean(previewUrl);
  const showLiveCamera = livePreviewVisible && !showRecordedPlayback;

  return (
    <div className="video-intro">
      <div className="video-intro__stage">
        {showRecordedPlayback ? (
          <video className="video-intro__video" src={previewUrl} controls playsInline />
        ) : showLiveCamera ? (
          <video ref={videoRef} className="video-intro__video" playsInline muted />
        ) : (
          <div className="video-intro__placeholder" role="status">
            Camera preview has been turned off. Use &quot;Enable camera&quot; to show the stream again.
          </div>
        )}
      </div>

      {error ? (
        <Alert variant="error" title="Camera or microphone" onDismiss={() => setError("")}>
          <p>{error}</p>
        </Alert>
      ) : null}

      <div
        className={`modal video-intro__policy-modal ${policyCutModalOpen ? "" : "is-hidden"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-intro-policy-cut-title"
      >
        <div
          className="modal-backdrop"
          onClick={() => setPolicyCutModalOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
        <div className="modal-card modal-card--policy-fill">
          <div className="modal-ornament" aria-hidden="true">
            ⚠
          </div>
          <h2 id="video-intro-policy-cut-title" className="modal-title">
            Recording stopped — camera unavailable
          </h2>
          <p className="modal-body">
            Recording was ended because the camera could not stay connected (timeout or policy). Nothing was saved.
            Try the steps below, then use &quot;Enable camera&quot; and record again.
          </p>
          <CameraConnectionErrorSolution compact selectionLocked />
          <div className="form-actions form-actions--end form-actions--compact">
            <button type="button" className="btn btn-primary" onClick={() => setPolicyCutModalOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      </div>

      <div className="video-intro__actions">
        <button type="button" className="btn btn-secondary" onClick={startPreview} disabled={recording}>
          Enable camera
        </button>
        {!recording ? (
          <button type="button" className="btn btn-primary" onClick={startRecording}>
            Start recording
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={stopRecording}>
            Stop
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={clearVideo} disabled={recording}>
          Clear recording
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setHelpOpen((v) => !v)}>
          Help
        </button>
      </div>

      {helpOpen ? <CameraConnectionErrorSolution /> : null}
    </div>
  );
}
