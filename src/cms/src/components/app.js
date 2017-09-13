import { h, Component } from 'preact';
import { Router } from 'preact-router';
import { Nav } from './nav/Nav';

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
			<div class="pure-g">
        <div class="pure-u-1">
          <Nav />
          <Router onChange={this.handleRoute}>
            <p path="/cms/">Home</p>
            <p path="/cms/courses/">Courses</p>
            <p path="/cms/courses/scraping/">Course Scraping</p>
          </Router>
        </div>
			</div>
		);
	}
}
