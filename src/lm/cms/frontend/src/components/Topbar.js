import { h, Component } from "preact";
import { AccountDropdown } from "./account/AccountDropdown";

export class Topbar extends Component {
  render(){
    return(
      <div>
        <a href="/cms">
          <div class="section logo">
            <img src="/static/cms/images/plane.png" />
            LIFTED Mobile CMS
          </div>
        </a>

        <AccountDropdown />

        <a href="/browse" target="_blank">
          <div class="section browse">
              ↪ Public course browser
          </div>
        </a>

      </div>
    );
  }
}
