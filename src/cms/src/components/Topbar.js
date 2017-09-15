import { h, Component } from "preact";
import { AccountDropdown } from "./account/AccountDropdown";

export class Topbar extends Component {
  render(){
    return(
      <div>
        <div class="section">
          <a href="/cms" class="logo">
            <img src="/static/cms/dist/images/plane.png" />
            LIFTED Mobile CMS
          </a>
        </div>

        <AccountDropdown />
      </div>
    );
  }
}
