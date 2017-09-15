import { h, Component } from 'preact';
import { Router, route } from 'preact-router';
import 'preact/devtools';
import { authFetch } from '../lib/fetch';
import { 
  BranchScreen,
  WhatCompetencyScreen, 
  JobScreen, 
  WhereWorkScreen,
  RoleScreen,
  GoalScreen,
  DiagScreen,
  DiagResultsScreen,
} from './screens';

import { renderLoader } from './screens/Screen';

export default class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      selectedAnswers: {},
    };
  }


  componentWillMount = () => {
    if (typeof window !== "undefined"){
      let storedSelectedAnswers = JSON.parse(
        sessionStorage.getItem("selectedAnswers"));
      if (storedSelectedAnswers){
        this.setState({
          selectedAnswers: storedSelectedAnswers,
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


  handleAnswerSelect = (qnNum, answer, isMultiQn, callback) => {
    let selectedAnswers = this.state.selectedAnswers;

    // Multi-select qns
    if (isMultiQn && qnNum === 3){
      let index = selectedAnswers[qnNum-1].indexOf(answer);
      if (index > -1){
        selectedAnswers[qnNum-1].splice(index, 1);
      }
      else{
        selectedAnswers[qnNum-1].push(answer);
      }
    }
    // Single-select qns
    else{
      selectedAnswers[qnNum] = [answer];
    }

    // Remove items selectedAnswers for higher qnNums
    Object.keys(selectedAnswers).forEach(q => {
      if (q > qnNum){
        delete selectedAnswers[q];
      }
    });

    // Store selectedAnswers to sessionStorage and the state
    sessionStorage.setItem("selectedAnswers", 
      JSON.stringify(selectedAnswers));
    this.setState({ selectedAnswers }, () => {
      // Run the callback, unless it's on the branch screen
      if (qnNum !== 3){ 
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

    let selectedAnswers = this.state.selectedAnswers;
    let storedSelectedAnswers = sessionStorage.getItem("selectedAnswers");

    // Use answers stored in session storage instead of state if 
    // state.selectedanswers == {}
    if (Object.keys(selectedAnswers).length == 0 && storedSelectedAnswers){
      selectedAnswers = JSON.parse(storedSelectedAnswers);
    }
    // If neither state nor sessionStorage contains the selectedAnswers,
    // route to /
    else if ((!selectedAnswers && !storedSelectedAnswers) ||
             (Object.keys(selectedAnswers).length === 0 
               && !storedSelectedAnswers)){
      route("/");
    }

		return (
      <Router>

        <JobScreen 
          qnNum={0}
          qnData={this.state.qns[0]}
          path="/"
          default
          handleAnswerSelect={this.handleAnswerSelect}
          nextScreenPath="/what" />

        <WhatCompetencyScreen
          qnNum={1}
          qnData={this.state.qns[1]}
          path={"/what"}
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers}
          nextScreenPath="/choose" />

        <BranchScreen
          qnNum={2}
          qnData={this.state.qns[2]}
          path="/choose"
          handleAnswerSelect={this.handleAnswerSelect}
          selectedAnswers={selectedAnswers} 
          nextScreenPath="/test" />

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

      </Router>
		);
	}
}
