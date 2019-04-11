[@bs.module] external logo: string = "./logo.svg";
[%bs.raw {|require('./App.css')|}];

[@react.component]
let make = () =>
  <div className="App">
    <header className="App-header">
      <img src=logo className="App-logo" alt="logo" />
      <p>
        {ReasonReact.string("Edit ")}
        <code> {ReasonReact.string("src/app.re ")} </code>
        {ReasonReact.string("and save to reload.")}
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer">
        {ReasonReact.string("Learn React")}
      </a>
    </header>
  </div>;