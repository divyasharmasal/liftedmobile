import { h, Component } from "preact";
import Dropdown, { DropdownTrigger, DropdownContent } from "react-simple-dropdown";
import "react-simple-dropdown/styles/Dropdown.css";

export class AccountDropdown extends Component {
  constructor(props){
    super(props);
  }


  render(){
    return(
      <div class="section account">
        <Dropdown>
          <DropdownTrigger>
            <img src="/static/cms/dist/images/user.png" />
            User
          </DropdownTrigger>
          <DropdownContent>
            <div class="subsection">
              Dropdown
            </div>
            <div class="subsection">
              <a href="/accounts/logout">Logout</a>
            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    );
  }
}
