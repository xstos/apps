import './App.css';
import { createSignal } from "solid-js";

const BasicComponent = props => {
    const value = () => props.value || "default";

    return <div>{value()}</div>;
};

export default function Form() {
  const [value, setValue] = createSignal("");

  return (
      <div>
        <BasicComponent value={value()} />
        <input type="text" oninput={e => setValue(e.currentTarget.value)} />
      </div>
  );
}

export function App() {
  return (
    <div class="App">
      <header class="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          class="App-link"
          href="https://github.com/ryansolid/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  );
}

