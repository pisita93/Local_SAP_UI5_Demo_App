/* global React, Ico */
// PhotoCapture — drag-drop / file pick / live camera capture. dataURL out.
const { useState, useRef, useEffect } = React;

function PhotoCapture({ value, onChange, label = 'Take photo', placeholder = 'Tap to capture or drop a photo', dark = false, aspect = 'auto' }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('idle'); // idle | camera | review
  const [streamErr, setStreamErr] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop stream on unmount / mode change
  useEffect(() => {
    return () => stopStream();
  }, []);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  async function openCamera() {
    setStreamErr(null);
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      // small async wait for video element mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (e) {
      setStreamErr(e.message || 'Camera not available');
    }
  }

  function shoot() {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 960;
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    onChange({ name: `photo-${Date.now()}.jpg`, dataUrl, size: Math.round(dataUrl.length * 0.75), source: 'camera' });
    stopStream();
    setMode('idle');
  }

  function cancelCamera() {
    stopStream();
    setMode('idle');
  }

  function onFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => onChange({ name: file.name, dataUrl: e.target.result, size: file.size, source: 'file' });
    reader.readAsDataURL(file);
  }

  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  }

  // If we have a value, show preview
  if (value && mode !== 'camera') {
    return (
      <div style={{border:'1px solid var(--border2)', borderRadius:8, padding:10, display:'flex', gap:12, alignItems:'center', background: dark ? '#1C1C1E' : 'var(--bg)'}}>
        <div style={{width:64, height:64, borderRadius:6, background: '#000', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
          {value.dataUrl ? <img src={value.dataUrl} alt="" style={{maxWidth:'100%', maxHeight:'100%', display:'block'}}/> : <Ico.Camera stroke="#fff"/>}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div className="fw700 fs13" style={{color: dark ? '#fff' : 'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value.name}</div>
          <div className="fs12" style={{color: dark ? 'rgba(235,235,245,0.6)' : 'var(--text2)', display:'flex', gap:6, alignItems:'center'}}>
            <span>{(value.size/1024).toFixed(1)} KB</span>
            <span>·</span>
            <span style={{color:'var(--pos-dark)', display:'inline-flex', alignItems:'center', gap:3}}><Ico.Check stroke="#25713A" width="12" height="12"/> {value.source === 'camera' ? 'Captured' : 'Uploaded'}</span>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={openCamera} title="Retake photo"><Ico.Camera/></button>
        <button type="button" className="icon-btn" onClick={() => onChange(null)} title="Remove"><Ico.Trash/></button>
      </div>
    );
  }

  if (mode === 'camera') {
    return (
      <div style={{borderRadius:8, overflow:'hidden', background:'#000', position:'relative'}}>
        {streamErr ? (
          <div style={{padding:'24px 20px', color:'#fff', textAlign:'center'}}>
            <div style={{fontWeight:700}}>Camera not available</div>
            <div style={{fontSize:13, marginTop:6, opacity:0.7}}>{streamErr}</div>
            <div style={{marginTop:12}}>
              <button type="button" className="btn btn-secondary" onClick={() => { setMode('idle'); inputRef.current?.click(); }}>Choose file instead</button>
            </div>
            <div style={{marginTop:8}}>
              <button type="button" className="btn btn-tertiary" onClick={cancelCamera} style={{color:'#fff'}}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted style={{width:'100%', display:'block', background:'#000', maxHeight:360}}/>
            {/* viewfinder corners */}
            <div style={{position:'absolute', inset:12, pointerEvents:'none'}}>
              {['nw','ne','sw','se'].map(c => (
                <div key={c} style={{
                  position:'absolute', width:24, height:24,
                  borderTop: (c==='nw'||c==='ne') ? '3px solid #fff' : 'none',
                  borderBottom: (c==='sw'||c==='se') ? '3px solid #fff' : 'none',
                  borderLeft: (c==='nw'||c==='sw') ? '3px solid #fff' : 'none',
                  borderRight: (c==='ne'||c==='se') ? '3px solid #fff' : 'none',
                  top: (c==='nw'||c==='ne') ? 0 : 'auto',
                  bottom: (c==='sw'||c==='se') ? 0 : 'auto',
                  left: (c==='nw'||c==='sw') ? 0 : 'auto',
                  right: (c==='ne'||c==='se') ? 0 : 'auto',
                  borderRadius: 3,
                }}/>
              ))}
            </div>
            <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'}}>
              <button type="button" onClick={cancelCamera} style={{background:'transparent', border:'none', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer'}}>Cancel</button>
              <button type="button" onClick={shoot} aria-label="Capture" style={{width:56, height:56, borderRadius:'50%', border:'4px solid #fff', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 2px #000'}}>
                <span style={{width:44, height:44, borderRadius:'50%', background:'#fff'}}/>
              </button>
              <div style={{width:56}}></div>
            </div>
          </>
        )}
      </div>
    );
  }

  // idle — show drop zone + camera CTA
  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      style={{
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:8, padding:'18px 14px', border:'1.5px dashed var(--border)', borderRadius:8,
        background: dark ? '#1C1C1E' : 'var(--bg-shell)',
        color: dark ? 'rgba(235,235,245,0.6)' : 'var(--text2)',
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e => onFile(e.target.files[0])}/>
      <div style={{width:36, height:36, borderRadius:'50%', background: dark ? '#000' : 'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue-h)'}}>
        <Ico.Camera/>
      </div>
      <div style={{fontWeight:700, fontSize:13, color: dark ? '#fff' : 'var(--text)'}}>{label}</div>
      <div style={{fontSize:12}}>{placeholder}</div>
      <div style={{display:'flex', gap:8, marginTop:6}}>
        <button type="button" className="btn btn-primary btn-compact" onClick={openCamera}>
          <Ico.Camera/> Take photo
        </button>
        <button type="button" className="btn btn-secondary btn-compact" onClick={() => inputRef.current?.click()}>
          Choose file
        </button>
      </div>
    </div>
  );
}

// ── Photo viewer (lightbox) ─────────────────────────────────────────
function PhotoViewer({ open, photo, title, onClose }) {
  if (!open || !photo) return null;
  return (
    <div className="dialog-overlay" onClick={onClose} style={{background:'rgba(0,0,0,0.85)'}}>
      <div style={{maxWidth:'90vw', maxHeight:'90vh', display:'flex', flexDirection:'column', gap:12}} onClick={e => e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', color:'#fff'}}>
          <div className="fw700 fs16">{title || photo.name}</div>
          <button className="icon-btn" onClick={onClose} style={{color:'#fff'}}><Ico.X/></button>
        </div>
        <img src={photo.dataUrl} alt={title || ''} style={{maxWidth:'90vw', maxHeight:'80vh', display:'block', borderRadius:8, background:'#000'}}/>
      </div>
    </div>
  );
}

Object.assign(window, { PhotoCapture, PhotoViewer });
