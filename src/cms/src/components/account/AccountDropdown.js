import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";
import Dropdown, { DropdownTrigger, DropdownContent } from "react-simple-dropdown";
import "react-simple-dropdown/styles/Dropdown.css";
import { authFetch } from "../../lib/fetch";

export class AccountDropdown extends Component {
  constructor(props){
    super(props);
    this.state = {
      accountName: null,
    };

  }


  closeDropdown = event => {
      const dropdownElement = findDOMNode(this.dropdown);
      const dd_content = dropdownElement.getElementsByClassName("dropdown__content")[0];

      if (this.dropdown != null && 
          event.target !== dropdownElement &&
          (!dropdownElement.contains(event.target) ||
          dd_content.contains(event.target)) &&
          this.dropdown.isActive()){

        this.dropdown.hide();
      }
  }

  componentWillMount = () => {
    if (typeof window !== "undefined") {
      window.addEventListener("click", event => {
        this.closeDropdown(event);
      });

      window.addEventListener("onTouchStart", event => {
        this.closeDropdown(event);
      });
    }

    authFetch("/cms/account_name/").then(response => {
      response.json().then(data => {
        this.setState({
          accountName: data.username,
        });
      });
    });
  }

  
  render(){
    return(
      <div class="section account">
        <Dropdown ref={dropdown => {this.dropdown = dropdown; }}>
          <DropdownTrigger>
            <img src="/static/cms/dist/images/user.png" />
            {this.state.accountName}
          </DropdownTrigger>
          <DropdownContent>
            <a href="/cms/modify_account" class="subsection">
              Modify account
            </a>
            <a href="/accounts/logout" class="subsection">
              Logout
            </a>
          </DropdownContent>
        </Dropdown>
      </div>
    );
  }
}
