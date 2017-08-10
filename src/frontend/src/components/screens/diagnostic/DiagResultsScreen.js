import { h, Component } from 'preact';
import { route } from 'preact-router';
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

    //if (!answers){
      //route("/")
    //}
    //else{
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
    //}
  }


  renderCompetencies = comps => {
    let results = [];
    const colors = {
      0: "rgb(23,32,42)",
      0.1: "rgb(25,47,48)",
      0.2: "rgb(26,62,53)",
      0.3: "rgb(28,76,59)",
      0.4: "rgb(30,91,65)",
      0.5: "rgb(32,106,71)",
      0.6: "rgb(33,121,76)",
      0.7: "rgb(35,136,82)",
      0.8: "rgb(37,150,88)",
      0.9: "rgb(38,165,93)",
      1: "rgb(40,180,99)",
    };

    let competencies = [];
    Object.keys(comps).forEach(key => {
      competencies.push({
        score: comps[key],
        text: key,
      });
    });

    competencies.sort((a, b) => a.score - b.score).reverse();
    let min = Math.min(...competencies.map(x => x.score));
    if (min > 0){
      min = 0;
    }

    competencies.forEach((c, i) => {
      competencies[i].score += Math.abs(min);
    });

    const scores = competencies.map(x => x.score);
    const total = scores.reduce((acc, cur) => acc + cur);
    const colorVals = scores.map(x => Math.round(x / total * 10) / 10);

    competencies.forEach((c, i) => {
      results.push(
        <p>
          <span style={{ 
            color: colors[colorVals[i]] 
          }}>
            {c.text}
          </span>
        </p>
      );
    });
    return <div>{results}</div>;
  }


  renderResults = results => {
    return (
      <div>
        <div class="competencies">
          <p>In order of strength:</p>
          {this.renderCompetencies(results)}
        </div>
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
            <h1>Your competencies</h1>
            {this.renderResults(this.state.results)}
          </div>
        </div>
      </div>
    );
  }
}
