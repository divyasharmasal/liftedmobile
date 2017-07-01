import React, { Component } from 'react';
import { render } from 'react-dom';
import { h } from 'preact';


class Foo extends Component {
  render() {
    return (<div>hi</div>);
  }
}

render(
  <Foo />, 
  document.body
);
