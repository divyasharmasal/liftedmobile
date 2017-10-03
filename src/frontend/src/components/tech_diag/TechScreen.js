import { h, Component } from 'preact';
import { route } from 'preact-router';
import { renderLoader } from "../../../../lib/js/loader_anim";
import { getSelectedOpts, storeSelectedOpts } from "../../lib/store";

export { 
  TechScreen, 
};


// Screen parent class
class TechScreen extends Component{
  constructor(props){
    super(props);

    if (window.location.pathname !== "/" &&
      window.location.pathname !== "/tech"){
      const storedOpts = getSelectedOpts();
      if (!storedOpts || Object.keys(storedOpts).length === 0){
        route("/tech");
      }
    }
  }


  componentDidMount = () => {
    window.scrollTo(0, 0);
  }


  renderStartOver = () => {
    return (
      <a class="no_user_select top_nav_link start_over" 
         onClick={() => { route("/") }}>
        ⟲ start over
      </a>
    );
  }


  handleOptionSelect = answer => {
    this.props.handleOptionSelect(
      this.props.name, answer, this.routeToNextScreen);
  }


  routeToNextScreen = () => {
    route(this.props.nextScreenPath);
  }
}

