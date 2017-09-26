import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";

export class Topbar extends Component{
  constructor(props){
    super(props);
    this.menu = null;
    this.menuBtn = null;
    this.state = {
      showMenu: false,
    };
  }


  closeMenu = () => {
    const menuElement = findDOMNode(this.menu);
    const menuBtnElement = findDOMNode(this.menuBtn);

    if (this.menu != null && 
      this.menuBtn != null && 
      this.state.showMenu &&
      event.target !== menuElement &&
      event.target !== menuBtnElement &&
      !menuBtnElement.contains(event.target) &&
      !menuElement.contains(event.target)){
      this.setState({ showMenu: false });
    }
  }


  componentWillMount = () => {
    if (typeof window !== "undefined") {
      window.addEventListener("click", event => {
        this.closeMenu(event);
      });

      window.addEventListener("onTouchStart", event => {
        this.closeMenu(event);
      });
    }
  }


  toggleMenu = () => {
    this.setState({
      showMenu: !this.state.showMenu,
    });
  }


  handleSearch = text => {
    text = text.trim();
    if (text.length > 0){
      this.props.handleSearch(text);
    }
  }


  handleSearchKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.handleSearch(event.target.value);
    }
  }


  render(){
    return(
      <div>
        <div class="topbar">
          <div onClick={this.toggleMenu}
            ref={m => {this.menuBtn = m}}
            class="menu_btn no_user_select">

            <img src="/static/app/dist/images/courses/menu.png" 
              alt="Menu" />

          </div>

          <div class="search">
            <input type="search" 
              placeholder="Search"
              ref={s => {this.searchInput = s}}
              onKeyUp={this.handleSearchKeyUp}
              class="search_input" 
              onKey
              name="search" />

            <div class="btn no_user_select"
              onClick={() => {
                this.handleSearch(this.searchInput.value);
              }} >
              <img src="/static/app/dist/images/search.png" alt="Search"/>
            </div>
          </div>

        </div>
        {this.state.showMenu &&
            <div 
              ref={m => {this.menu = m}}
              class="menu">
              Menu
            </div>
        }
      </div>

    );
  }
}
