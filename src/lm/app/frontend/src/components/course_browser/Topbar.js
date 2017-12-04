import { h, Component } from "preact";
import { route } from "preact-router";

export class Topbar extends Component{
  constructor(props){
    super(props);
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
          <div 
            onClick={() => {
              route("/");
            }}
            class="logo">
            <img src="/static/app/dist/images/back_home.png" alt="back"/>
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
      </div>

    );
  }
}
