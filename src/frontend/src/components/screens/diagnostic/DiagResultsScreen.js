import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../../Question';
import { authFetch } from '../../fetch';
import {
  renderLoader,
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

    if (!answers){
      route("/")
    }
    else{
      let url = "/results?";
      // Append vertical ID
      const verticalId = this.props.selectedAnswers[0][0] + 1;
      url += "v=" + encodeURIComponent(verticalId);
      // Append answer data
      Object.keys(answers).forEach(compId => {
        let answer = answers[compId];
          url += "&" + encodeURIComponent(compId) + "=" + 
                       encodeURIComponent(answer);
      });

      authFetch(url).then(response => {
        response.json().then(results => {
          this.setState({ 
            results: results.competencies,
            courses: results.courses,
          });
        });
      });
    }
  }


  renderCompetencies = comps => {

    const stars = score => {
      const empty = <span class="empty star">☆</span>;
      const full = <span class="star">★</span>;
      const max = 5;
      const numFull = Math.round(score / 20);
      const numEmpty = max - numFull;

      let stars = [];
      for (let i=0; i<numFull; i++){
        stars.push(full);
      }
      for (let i=0; i<numEmpty; i++){
        stars.push(empty);
      }

      return stars;
    }


    let ordinary = [];
    let special = [];
    Object.keys(comps).forEach(k => {
      const item = {
        name: k,
        score: comps[k].score,
      };

      if (comps[k].special){
        item.special = comps[k].special;
        special.push(item);
      }
      else{
        ordinary.push(item);
      }
    });

    ordinary.sort((a, b) => a.score - b.score).reverse();
    special.sort((a, b) => a.score - b.score).reverse();

    const renderRows = results => {
      let rows = [];
      results.forEach(r => {
        rows.push(
          <tr>
            <td>{r.name}</td>
            <td>{stars(r.score)}</td>
          </tr>
        );
      });
      return rows;
    };

    const renderTable = (ordinary, special) => {
      return (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Rating</th>
            </tr>
          </thead>
          {renderRows(ordinary)}
          {special.length > 0 && 
            <tr>
              <td class="special" colspan={4}>
                Areas of specialisation you may want to consider:
              </td>
            </tr>
          }
          {special.length > 0 && 
            <tbody>
              {renderRows(special)}
            </tbody>
          }
        </table>
      );
    }

    return (
      <div>
        {renderTable(ordinary, special)}
      </div>
    );
  }


  render(){
    if (!this.state.results){
      return renderLoader();
    }
    return(
      <div className="pure-g">
        <div className="pure-u-1">
          <div className="question results">
            <h1>Your competencies</h1>
            <div class="competencies">
              {this.renderCompetencies(this.state.results)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
