import { h, Component } from "preact";
import { Router, route } from "preact-router";
import "preact/devtools";
import { authFetch } from "../lib/fetch";
import { getSelectedOpts, storeSelectedOpts, clearSelectedItems } from "../lib/store";
import { 
  BranchScreen,
  WhatCompetencyScreen, 
  VerticalScreen, 
  WhereWorkScreen,
  RoleScreen,
  GoalScreen,
  DiagScreen,
  DiagResultsScreen,
} from "./screens";

import { renderLoader } from "./screens/Screen";

export default class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      selectedOptions: {},
    };
  }


  componentWillMount = () => {
    const storedSelectedOpts = getSelectedOpts();

    if (storedSelectedOpts){
      this.setState({
        selectedOptions: storedSelectedOpts,
      });
    }

    let storedDiagAnswers = JSON.parse(
      sessionStorage.getItem("diagAnswers"));
    if (storedDiagAnswers){
      this.setState({
        diagAnswers: storedDiagAnswers,
      });
    }
  }


  componentDidMount = () => {
    authFetch("/qns").then(response => {
      if (response.ok){
        return response.json();
      }
    }).then(qns => {
      this.setState({ qns });
    }).catch(err =>{
      console.error(err);
    });
  }


  handleOptionSelect = (name, answer, isMultiQn, callback) => {
    // Store answer to sessionStorage and the component state
    if (isMultiQn){
      console.log(name, answer, isMultiQn);
    }
    else{
      let selectedOptions = this.state.selectedOptions;
      selectedOptions[name] = answer;

      storeSelectedOpts(selectedOptions);

      this.setState({ selectedOptions }, () => {
        callback();
      });

    }

  }


  handleAnswerSelect = (qnNum, answer, isMultiQn, callback) => {
    //let selectedAnswers = this.state.selectedAnswers;

    //// Multi-select qns
    //if (isMultiQn && qnNum === 3){
      //let index = selectedAnswers[qnNum-1].indexOf(answer);
      //if (index > -1){
        //selectedAnswers[qnNum-1].splice(index, 1);
      //}
      //else{
        //selectedAnswers[qnNum-1].push(answer);
      //}
    //}
    //// Single-select qns
    //else{
      //selectedAnswers[qnNum] = [answer];
    //}

    //// Remove items selectedAnswers for higher qnNums
    //Object.keys(selectedAnswers).forEach(q => {
      //if (q > qnNum){
        //delete selectedAnswers[q];
      //}
    //});

    //// Store selectedAnswers to sessionStorage and the state
    //sessionStorage.setItem("selectedAnswers", 
      //JSON.stringify(selectedAnswers));
    //this.setState({ selectedAnswers }, () => {
      //// Run the callback, unless it's on the branch screen
      //if (qnNum !== 3){ 
        //callback();
      //}
    //});
  }


	/** Gets fired when the route changes.
   *	@param {Object} event	"change" event from 
   *	[preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;

    if (e.url === "/"){
      this.setState({
        selectedOptions: {}
      }, () => {
        clearSelectedItems();
      });
    }

    // Update Google Analytics
    if (typeof window !== "undefined"){
      if (window.ga !== null){
        ga("set", "page", e.url);
        ga("send", "pageview");
      }
    }

	};


  routeToDiagResults = answers => {
    this.setState({
      diagAnswers: answers,
    }, () => {
      route("/test/results");
    });
  }


  render = () => {
    if (!this.state.qns){
      return renderLoader();
    }

		return (
      <Router onChange={this.handleRoute}>

        <VerticalScreen 
          default
          name="vertical"
          deps={[]}
          qnData={this.state.qns["Vertical"]}
          path="/"
          handleOptionSelect={this.handleOptionSelect}
          nextScreenPath="/what" />

        <WhatCompetencyScreen
          name="comp_category"
          qnData={this.state.qns["CompetencyCategory"]}
          path={"/what"}
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          nextScreenPath="/choose" />

        <BranchScreen
          name="needs"
          qnData={this.state.qns["Need"]}
          path="/choose"
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          nextScreenPath="/test" />

        {/*

        <WhereWorkScreen
          qnNum={4}
          qnData={this.state.qns[3]}
          path="/test"
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers}
          nextScreenPath="/test/role" />

        <RoleScreen
          qnNum={5}
          path="/test/role"
          isNextRole={false}
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers}
          nextScreenPath="/test/goal" />

        <GoalScreen
          qnNum={6}
          qnData={this.state.qns[4]}
          path="/test/goal"
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers} />

        <RoleScreen
          qnNum={7}
          path="/test/nextrole"
          isNextRole={true}
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers}
          nextScreenPath="/test/diag" />

        <DiagScreen
          qnNum={8}
          path="/test/diag"
          routeToDiagResults={this.routeToDiagResults}
          selectedAnswers={selectedAnswers}
          nextScreenPath="/test/results" />
        
        <DiagResultsScreen
          path="/test/results"
          selectedAnswers={selectedAnswers} 
          answers={this.state.diagAnswers} />
        */}

      </Router>
		);
	}
}
