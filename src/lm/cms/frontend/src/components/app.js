import { h, Component } from "preact";
import { Router } from "preact-router";
import { Navbar } from "./Navbar";
import { Topbar } from "./Topbar";
import { HomePage } from "./pages/HomePage";
import { PublishedCoursesPage } from "./pages/courses/PublishedCoursesPage";
import { UnpublishedCoursesPage } from "./pages/courses/UnpublishedCoursesPage";
import { ScrapersPage } from "./pages/ScrapersPage";
import { StaffPage } from "./pages/StaffPage";
import { ModifyAccountPage } from "./pages/ModifyAccountPage";

export default class App extends Component {

	/** Gets fired when the route changes.
   *	@param {Object} event	"change" event from
   *	[preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
  handleRoute = e => {
    this.currentUrl = e.url;

    // Update Google Analytics
    if (typeof window !== "undefined"){
      if (window.ga && window.ga !== null){
        ga("set", "page", e.url);
        ga("send", "pageview");
      }
    }

	};

	render() {
		return (
      <div class="cms pure-g">
        <div class="topbar pure-u-1-1">
          <Topbar />
        </div>

        <div class="navbar pure-u-1 pure-u-lg-1-5">
          <Navbar />
        </div>

        <div class="pure-u-1 pure-u-lg-4-5">
          <div class="content">
            <Router onChange={this.handleRoute}>
              {/*<HomePage path="/cms/" />*/}
              <PublishedCoursesPage path="/cms/" />

              <PublishedCoursesPage path="/cms/courses/published" />
              <UnpublishedCoursesPage path="/cms/courses/unpublished" />
              <ScrapersPage path="/cms/scrapers/" />
              {/*<StaffPage path="/cms/staff/" />*/}
              <ModifyAccountPage path="/cms/modify_account/" />
            </Router>
          </div>
        </div>

      </div>
		);
	}
}
