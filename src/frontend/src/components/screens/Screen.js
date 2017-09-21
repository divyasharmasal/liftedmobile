import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../Question';
import { renderLoader } from "../../../../lib/js/loader_anim";

export { 
  Screen, 
  createCoursesUrl, 
  renderLoader,
  renderStartOver,
};


// Screen parent class
class Screen extends Component{
  componentDidMount = () => {
    window.scrollTo(0, 0);
  }

  componentWillMount = () => {
    if (!this.state.selectedAnswers && 
      // Route to / if there are no selectedAnswers in state
      // or in sessionStorage
        !sessionStorage.getItem("selectedAnswers")){
      route("/");
    }
  }


  renderStartOver = () => {
    return (
      <a class="no_user_select top_nav_link start_over" 
         onClick={() => { route("/") }}>
        ⟲ start over
      </a>
    );
  }


  handleAnswerSelect = (index, isMultiQn) => {
    // Let the App handle the answer selection and route to the next
    // screen
    this.props.handleAnswerSelect(this.props.qnNum, index, isMultiQn, 
      this.routeToNextScreen);
  }


  routeToNextScreen = () => {
    // Route to nextScreenPath
    route(this.props.nextScreenPath);
  }
}
