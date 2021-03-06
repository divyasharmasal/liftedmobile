import { h, Component } from 'preact';
import { route } from 'preact-router';
import { renderLoader } from "../../../../../../lib/js/loader_anim";
import { getSelectedOpts, storeSelectedOpts } from "../../lib/store";

export { 
  Screen, 
  createCoursesUrl, 
  renderLoader,
  renderStartOver,
};


// Screen parent class
class Screen extends Component{
  constructor(props){
    super(props);

    if (window.location.pathname !== "/" &&
      window.location.pathname !== "/analysis"){
      const storedOpts = getSelectedOpts();
      if (!storedOpts || Object.keys(storedOpts).length === 0){
        route("/analysis");
      }
    }
  }


  // Scroll up when mounted
  componentDidMount = () => {
    window.scrollTo(0, 0);
  }


  renderStartOver = isTech => {
    const path = isTech ? "/tech" : "/analysis";
    return (
      <a class="no_user_select top_nav_link start_over" 
         onClick={() => { route(path) }}>
        ⟲ start over
      </a>
    );
  }


  handleOptionSelect = answer => {
    this.props.handleOptionSelect(this.props.name, answer, 
                                  this.routeToNextScreen);
  }


  routeToNextScreen = () => {
    route(this.props.nextScreenPath);
  }
}
