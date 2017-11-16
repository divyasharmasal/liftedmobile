import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";
import Dropdown, { DropdownTrigger, DropdownContent } from "react-simple-dropdown";
import "react-simple-dropdown/styles/Dropdown.css";
import { authFetch } from "../../lib/js/fetch";

export class AccountDropdown extends Component {
  constructor(props){
    super(props);
    this.state = {
      accountName: null,
    };
  }


  closeDropdown = event => {
    const dropdownElement = findDOMNode(this.dropdown);
    const ddContent = dropdownElement
      .getElementsByClassName("dropdown__content")[0];

    if (this.dropdown != null && 
        event.target !== dropdownElement &&
        ( 
          !dropdownElement.contains(event.target) ||
          ddContent.contains(event.target)
        ) &&
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
            <img src="/static/cms/images/user.png" />
            {this.state.accountName}
          </DropdownTrigger>
          <DropdownContent>
            <a href="/cms/modify_account" class="subsection">
              Modify account
            </a>
            <a href="/cms/accounts/logout/" class="subsection">
              Logout
            </a>
          </DropdownContent>
        </Dropdown>
      </div>
    );
  }
}
