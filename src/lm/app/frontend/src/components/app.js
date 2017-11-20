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
  IntroScreen,
  BranchScreen,
  WhatCompetencyScreen, 
  VerticalScreen, 
  WhereWorkScreen,
  RoleScreen,
  GoalScreen,
  DiagScreen,
  DiagResultsScreen,
} from "./screens";

import { CourseBrowser } from "./course_browser";
import { TechRoleScreen } from "./tech_diag";
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

    if (e.url === "/" || e.url === "/analysis"){
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


  render = () => {
    if (!this.state.qns){
      return renderLoader();
    }

		return (
      <Router onChange={this.handleRoute}>
        <IntroScreen
          default
          path="/" />

        <CourseBrowser
          path="/browse" />

        <TechRoleScreen
          name="tech_role"
          handleOptionSelect={this.handleOptionSelect}
          qnData={this.state.qns["tech_role"]}
          path="/tech" 
          nextScreenPath="/tech/diag" />

        <DiagScreen
          name="tech_diag"
          techRole={this.state.selectedOptions["tech_role"]}
          handleOptionSelect={this.handleOptionSelect}
          resultsPath="/tech/results"
          path="/tech/diag" />
        
        <DiagResultsScreen
          path="/tech/results"
          techRole={this.state.selectedOptions["tech_role"]}
          selectedOptions={this.state.selectedOptions} />

        <VerticalScreen 
          name="vertical"
          qnData={this.state.qns["vertical"]}
          path="/analysis"
          handleOptionSelect={this.handleOptionSelect}
          nextScreenPath="/what" />

        <WhatCompetencyScreen
          name="comp_category"
          qnData={this.state.qns["comp_category"]}
          path={"/what"}
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          vertical={this.state.selectedOptions["vertical"]}
          nextScreenPath="/choose"
          diagPaths={{
            1: "/review/role",
            2: "/review/role",
            3: "/review/where"
          }}
        />

        <BranchScreen
          name="needs"
          qnData={this.state.qns["need"]}
          path="/choose"
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          vertical={this.state.selectedOptions["vertical"]}
          compCategory={this.state.selectedOptions["comp_category"]}
          nextScreenPaths={{
            1: "/review/role",
            2: "/review/role",
            3: "/review/where"
          }} 
        />

        <WhereWorkScreen
          name="legalsupport_where"
          qnData={this.state.qns["where"]}
          path="/review/where"
          handleOptionSelect={this.handleOptionSelect}
          nextScreenPath="/review/role" />

        <RoleScreen
          name="role"
          path="/review/role"
          isNextRole={false}
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          vertical={this.state.selectedOptions["vertical"]}
          workplace={this.state.selectedOptions["legalsupport_where"]}
          nextScreenPaths={{
            "hasNext": "/review/goal",
            "atEnd": "/review/diag",
          }} />

        <GoalScreen
          name="goal"
          qnData={this.state.qns["goal"]}
          path="/review/goal"
          handleOptionSelect={this.handleOptionSelect}
          nextScreenPaths={{
            0: "/review/nextrole",
            1: "/review/diag",
          }} />

        <RoleScreen
          name="nextrole"
          path="/review/nextrole"
          isNextRole={true}
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          vertical={this.state.selectedOptions["vertical"]}
          workplace={this.state.selectedOptions["legalsupport_where"]}
          nextScreenPath="/review/diag" />

        <DiagScreen
          name="diag"
          path="/review/diag"
          handleOptionSelect={this.handleOptionSelect}
          selectedOptions={this.state.selectedOptions}
          resultsPath="/review/results" />
        
        <DiagResultsScreen
          path="/review/results"
          selectedOptions={this.state.selectedOptions} />

      </Router>
		);
	}
}
