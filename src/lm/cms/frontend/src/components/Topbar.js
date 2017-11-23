import { h, Component } from "preact";
import { AccountDropdown } from "./account/AccountDropdown";

export class Topbar extends Component {
  render(){
    return(
      <div>
        <div class="section logo">
          <a href="/cms">
            <img src="/static/cms/images/plane.png" />
            LIFTED Mobile CMS
          </a>
        </div>

        <AccountDropdown />

        <div class="section browse">
          <a href="/browse" target="_blank">
            ↪ Public course browser
          </a>
        </div>

      </div>
    );
  }
}
