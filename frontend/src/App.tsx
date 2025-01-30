
import { Fullscreen } from './Fullscreen/index.js';
import { PlayerBitProvider, usePlayerBit } from './player-bit';
import { Field } from './Field';
import './App.css'

function Start() {
  const { bit, createOrLoadBitAsync } = usePlayerBit();

  return !bit && (
    <button onClick={createOrLoadBitAsync}>Start</button>
  );
}

function BitInfo() {
  const { bit } = usePlayerBit();
  return <div style={{display: "none"}}>{JSON.stringify(bit)}</div>;
}

function App() {
  return (
    <PlayerBitProvider>
      <Fullscreen>
        <Start />
        <BitInfo />
        <Field />
      </Fullscreen>
    </PlayerBitProvider>
  )
}

export default App
