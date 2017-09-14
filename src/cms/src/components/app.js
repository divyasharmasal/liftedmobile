import { h, Component } from "preact";
import { Router } from "preact-router";
import { Navbar } from "./Navbar";
import { Topbar } from "./Topbar";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { ScrapersPage } from "./pages/ScrapersPage";
import { StaffPage } from "./pages/StaffPage";

export default class App extends Component {
  /** 
   * Gets fired when the route changes.  
   *
   * @param {Object} event
   * "change" event from [preact-router](http://git.io/preact-router)
   *
   * @param {string} event.url	
   * The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;
    console.log(this.currentUrl)
	};

	render() {
		return (
			<div class="cms pure-g">
          <div class="topbar pure-u-1-1">
            <Topbar />
          </div>

          <div class="navbar pure-u-1 pure-u-sm-1-5">
            <Navbar />
          </div>

          <div class="content pure-u-1 pure-u-sm-1-5">
            <Router onChange={this.handleRoute}>
              <HomePage path="/cms/" />
              <CoursesPage path="/cms/courses/" />
              <ScrapersPage path="/cms/scrapers/" />
              <StaffPage path="/cms/staff/" />
            </Router>
          </div>

			</div>
		);
	}
}
