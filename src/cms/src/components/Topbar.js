import { h, Component } from "preact";
import { AccountDropdown } from "./account/AccountDropdown";

export class Topbar extends Component {
  render(){
    return(
      <div>
        <div class="section">
          <div class="logo">
            <img src="/static/cms/dist/images/plane.png" />
            <a href="/cms">LIFTED Mobile CMS</a>
          </div>
        </div>

        <AccountDropdown />
      </div>
    );
  }
}
