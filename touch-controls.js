/**
 * Resonance - Touch Controls for Mobile Devices
 * 
 * Provides a sleek, semi-transparent dual-zone touch control overlay:
 * - Left Zone: Virtual joystick for movement (simulates W/A/S/D keyboard events)
 * - Right Zone: Touch drag for camera orientation (simulates mouse movement)
 * - Action Button: Tap to Jump (Spacebar) or Interact
 * 
 * Automatically activates only on touch-capable mobile devices.
 * Leaves desktop keyboard/mouse controls completely intact.
 */

(function initTouchControls() {
  // Only initialize on touch devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) {
    return;
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'resonance-mobile-touch-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 24px;
    box-sizing: border-box;
  `;

  // --- Left: Virtual Joystick Zone ---
  const joystickZone = document.createElement('div');
  joystickZone.id = 'joystick-zone';
  joystickZone.style.cssText = `
    position: relative;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(4px);
    pointer-events: auto;
    touch-action: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.03);
  `;

  const joystickThumb = document.createElement('div');
  joystickThumb.style.cssText = `
    position: absolute;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(224, 242, 254, 0.35) 0%, rgba(56, 189, 248, 0.15) 100%);
    border: 1.5px solid rgba(186, 230, 253, 0.4);
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
    transition: transform 0.05s ease-out;
    pointer-events: none;
  `;
  joystickZone.appendChild(joystickThumb);

  // --- Right: Action Buttons & Camera Area ---
  const rightControls = document.createElement('div');
  rightControls.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-end;
    pointer-events: auto;
  `;

  // Jump / Ascend Button
  const jumpBtn = document.createElement('button');
  jumpBtn.innerHTML = '▲ JUMP';
  jumpBtn.style.cssText = `
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.85);
    font-family: 'Cinzel', serif, sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    backdrop-filter: blur(4px);
    touch-action: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  `;
  rightControls.appendChild(jumpBtn);

  overlay.appendChild(joystickZone);
  overlay.appendChild(rightControls);

  // --- Right Zone Camera Touch Area (Full Right Half) ---
  const cameraTouchZone = document.createElement('div');
  cameraTouchZone.id = 'camera-touch-zone';
  cameraTouchZone.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 55vw;
    height: 100vh;
    pointer-events: auto;
    touch-action: none;
    z-index: 9998;
  `;

  document.body.appendChild(cameraTouchZone);
  document.body.appendChild(overlay);

  // --- Keyboard Dispatch Helper ---
  const activeKeys = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false
  };

  function sendKeyEvent(type, code, key) {
    const event = new KeyboardEvent(type, {
      code: code,
      key: key,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
  }

  function setKeyState(code, key, pressed) {
    if (activeKeys[code] !== pressed) {
      activeKeys[code] = pressed;
      sendKeyEvent(pressed ? 'keydown' : 'keyup', code, key);
    }
  }

  // --- Joystick Logic ---
  let joystickTouchId = null;
  let joystickCenter = { x: 0, y: 0 };
  const maxRadius = 45;

  joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (joystickTouchId !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;
    const rect = joystickZone.getBoundingClientRect();
    joystickCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    handleJoystickMove(touch.clientX, touch.clientY);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId) {
        e.preventDefault();
        handleJoystickMove(touch.clientX, touch.clientY);
        break;
      }
    }
  }, { passive: false });

  function endJoystick(e) {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId) {
        joystickTouchId = null;
        joystickThumb.style.transform = 'translate(0px, 0px)';
        setKeyState('KeyW', 'w', false);
        setKeyState('KeyS', 's', false);
        setKeyState('KeyA', 'a', false);
        setKeyState('KeyD', 'd', false);
        break;
      }
    }
  }

  window.addEventListener('touchend', endJoystick);
  window.addEventListener('touchcancel', endJoystick);

  function handleJoystickMove(clientX, clientY) {
    const dx = clientX - joystickCenter.x;
    const dy = clientY - joystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, maxRadius);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

    const deadZone = 12;
    if (dist > deadZone) {
      // Forward / Backward
      if (dy < -deadZone * 0.8) {
        setKeyState('KeyW', 'w', true);
        setKeyState('KeyS', 's', false);
      } else if (dy > deadZone * 0.8) {
        setKeyState('KeyS', 's', true);
        setKeyState('KeyW', 'w', false);
      } else {
        setKeyState('KeyW', 'w', false);
        setKeyState('KeyS', 's', false);
      }

      // Left / Right
      if (dx < -deadZone * 0.8) {
        setKeyState('KeyA', 'a', true);
        setKeyState('KeyD', 'd', false);
      } else if (dx > deadZone * 0.8) {
        setKeyState('KeyD', 'd', true);
        setKeyState('KeyA', 'a', false);
      } else {
        setKeyState('KeyA', 'a', false);
        setKeyState('KeyD', 'd', false);
      }
    } else {
      setKeyState('KeyW', 'w', false);
      setKeyState('KeyS', 's', false);
      setKeyState('KeyA', 'a', false);
      setKeyState('KeyD', 'd', false);
    }
  }

  // --- Jump Button Logic ---
  jumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jumpBtn.style.transform = 'scale(0.92)';
    jumpBtn.style.background = 'rgba(56, 189, 248, 0.25)';
    setKeyState('Space', ' ', true);
  }, { passive: false });

  function endJump(e) {
    jumpBtn.style.transform = 'scale(1)';
    jumpBtn.style.background = 'rgba(255, 255, 255, 0.06)';
    setKeyState('Space', ' ', false);
  }
  jumpBtn.addEventListener('touchend', endJump);
  jumpBtn.addEventListener('touchcancel', endJump);

  // --- Camera Touch / Drag Logic ---
  let cameraTouchId = null;
  let lastCameraX = 0;
  let lastCameraY = 0;

  cameraTouchZone.addEventListener('touchstart', (e) => {
    // Ignore touches on right buttons
    if (e.target === jumpBtn || jumpBtn.contains(e.target)) return;
    if (cameraTouchId !== null) return;
    const touch = e.changedTouches[0];
    cameraTouchId = touch.identifier;
    lastCameraX = touch.clientX;
    lastCameraY = touch.clientY;
  }, { passive: true });

  cameraTouchZone.addEventListener('touchmove', (e) => {
    if (cameraTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchId) {
        const movementX = (touch.clientX - lastCameraX) * 1.5;
        const movementY = (touch.clientY - lastCameraY) * 1.5;
        lastCameraX = touch.clientX;
        lastCameraY = touch.clientY;

        // Dispatch simulated mousemove event for camera controls
        const mouseEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: touch.clientX,
          clientY: touch.clientY,
          movementX: movementX,
          movementY: movementY
        });
        window.dispatchEvent(mouseEvent);
        document.dispatchEvent(mouseEvent);
        break;
      }
    }
  }, { passive: true });

  function endCamera(e) {
    if (cameraTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === cameraTouchId) {
        cameraTouchId = null;
        break;
      }
    }
  }
  cameraTouchZone.addEventListener('touchend', endCamera);
  cameraTouchZone.addEventListener('touchcancel', endCamera);

  console.info('[Resonance] Mobile touch joystick and camera controls initialized successfully.');
})();
