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


  renderCompetencies = comps => {
    let competencies = comps.sort((a, b) => a.score - b.score).reverse();

    const limegreenColors = {
      0.2: "rgb(229,249,229)",
      0.3: "rgb(201,242,201)",
      0.4: "rgb(168,234,168)",
      0.5: "rgb(130,225,130)",
      0.6: "rgb(83,213,83)",
      0.7: "rgb(48,195,48)",
      0.8: "rgb(42,172,42)",
      0.9: "rgb(35,143,35)",
      1: "rgb(25,103,25)",
    };

    const orangeRedColors = {
      0.2: "rgb(255,241,235)",
      0.3: "rgb(255,225,214)",
      0.4: "rgb(255,208,190)",
      0.5: "rgb(255,188,164)",
      0.6: "rgb(255,165,132)",
      0.7: "rgb(255,137,93)",
      0.8: "rgb(255,97,39)",
      0.9: "rgb(228,62,0)",
      1: "rgb(166,45,0)",
    };

    let scores = competencies.map(x => x.score);
    const minScore = Math.min(...scores);
    let isGood = true;
    if (minScore < 0){
      scores = scores.map(x => x + Math.abs(minScore));
      isGood = false;
    }

    const total = scores.reduce((acc, cur) => acc + cur);
    let result = [];

    competencies.forEach((c, i) => {
      let colorDeg = Math.round(scores[i] / total * 10) / 10 + 0.5;
      if (colorDeg > 1){
        colorDeg = 1
      };

      let color;
      if (isGood){
        color = limegreenColors[colorDeg];
      }
      else{
        color = orangeRedColors[colorDeg];
      }
      result.push(
        <li><span style={{ color:color }}>{c.text}</span></li>
      );
    });
    return <ul>{result}</ul>;
  }


  renderResults = results => {
    let good = [];
    let improve = [];
    Object.keys(results).forEach(result => {
      const r = {
        score: results[result],
        text: result
      };

      if (results[result] > 0){
        good.push(r);
      }
      else{
        improve.push(r);
      }
    });

    let goodElms = this.renderCompetencies(good);
    let improveElms = this.renderCompetencies(improve);

    return (
      <div class="competencies">
        {good.length > 0 &&
          <div class="good pure-u-md-11-24">
            <h2>Your key competencies:</h2>
            {goodElms}
          </div>
        }

        <div class="pure-u-md-1-24"></div>

        {improve.length > 0 &&
          <div class="improve pure-u-md-11-24">
            <h2>Areas for improvement:</h2>
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
            <h1>Your learning needs</h1>
            {this.renderResults(this.state.results)}
          </div>
        </div>
      </div>
    );
  }
}
