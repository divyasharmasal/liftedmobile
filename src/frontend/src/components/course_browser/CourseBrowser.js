import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";
import { route } from "preact-router";

import { Topbar } from "./Topbar";

export class CourseBrowser extends Component{
  render(){
    return(
      <div>
        <Topbar 
          handleSearch={console.log}
        />

      <div class="pure-g">
        <div class="pure-u-1">
          <div class="courses">
            courses
          </div>
        </div>
      </div>
      </div>
    );
  }
}

