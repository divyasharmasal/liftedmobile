import { h, Component } from 'preact';
import Question from '../../Question';
import { authFetch } from '../../fetch';
import {
  Screen, 
} from '../Screen';

export {DiagResultsScreen};

class DiagResultsScreen extends Screen{
  componentWillMount = () => {
    let answers = this.props.answers;
    if (this.props.answers){
      sessionStorage.setItem("diagAnswers", JSON.stringify(answers));
    }
    else{
      answers = JSON.parse(sessionStorage.getItem("diagAnswers"));
    }

    let url = "/results?";
    Object.keys(answers).forEach(compId => {
      let answer = answers[compId];
        url += "&" + encodeURIComponent(compId) + "=" + 
                     encodeURIComponent(answer);
    });

    authFetch(url).then(response => {
      response.json().then(results => {
        this.setState({ results });
      });
    });

  }


  renderCompetencies = competencies => {
    let result = [];
    competencies.forEach(c => {
      result.push(
        <li><span>{c}</span></li>
      );
    });
    return <ul>{result}</ul>;
  }


  renderResults = results => {
    let good = [];
    let improve = [];
    Object.keys(results).forEach(result => {
      if (results[result] > 0){
        good.push(result);
      }
      else{
        improve.push(result);
      }
    });

    let goodElms = this.renderCompetencies(good);
    let improveElms = this.renderCompetencies(improve);

    return (
      <div class="competencies">
        {good.length > 0 &&
          <div class="good">
            <h2>Your key competencies are:</h2>
            {goodElms}
          </div>
        }
        {improve.length > 0 &&
          <div class="improve">
            <h2>You might like to improve in:</h2>
            {improveElms}
          </div>
        }
      </div>
    );
  }


  render(){
    if (!this.state.results){
      return [];
    }
    return(
      <div className="pure-g">
        <div className="pure-u-1">
          <div className="question results">
            <h1>Your learning needs diagnostic results</h1>
            {this.renderResults(this.state.results)}
          </div>
        </div>
      </div>
    );
  }
}
