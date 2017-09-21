import { h, Component } from "preact";
import { Router, route } from "preact-router";
import "preact/devtools";
import { authFetch } from "../lib/fetch";

import { 
  getSelectedOpts, 
  storeSelectedOpts, 
  clearSelectedItems 
} from "../lib/store";

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


  handleOptionSelect = (name, answer, callback=null) => {
    // Store answer to sessionStorage and the component state
    let selectedOptions = this.state.selectedOptions;
    selectedOptions[name] = answer;

    storeSelectedOpts(selectedOptions);

    this.setState({ selectedOptions }, () => {
      if (callback){
        callback();
      }
    });
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
          qnData={this.state.qns["vertical"]}
          path="/"
          handleOptionSelect={this.handleOptionSelect}
          nextScreenPath="/what" />

        <WhatCompetencyScreen
          name="comp_category"
          qnData={this.state.qns["competency_category"]}
          path={"/what"}
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          nextScreenPath="/choose" />

        <BranchScreen
          name="needs"
          qnData={this.state.qns["need"]}
          path="/choose"
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          nextScreenPaths={{
            1: "review/role",
            2: "review/role",
            3: "review/where"
          }} />

        <WhereWorkScreen
          name="legalsupport_where"
          qnData={this.state.qns["where"]}
          path="/review/where"
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          nextScreenPath="/review/role" />

        <RoleScreen
          name="role"
          path="/review/role"
          isNextRole={false}
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          nextScreenPath="/review/goal" />

        {/*
        <GoalScreen
          qnNum={6}
          qnData={this.state.qns[4]}
          path="/review/goal"
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers} />

        <RoleScreen
          qnNum={7}
          path="/review/nextrole"
          isNextRole={true}
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers}
          nextScreenPath="/review/diag" />

        <DiagScreen
          qnNum={8}
          path="/review/diag"
          routeToDiagResults={this.routeToDiagResults}
          selectedAnswers={selectedAnswers}
          nextScreenPath="/review/results" />
        
        <DiagResultsScreen
          path="/review/results"
          selectedAnswers={selectedAnswers} 
          answers={this.state.diagAnswers} />
        */}

      </Router>
		);
	}
}
