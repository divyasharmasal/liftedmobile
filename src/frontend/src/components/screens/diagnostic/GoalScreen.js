import { h, Component } from 'preact';
import Question from '../../Question';
import { route } from 'preact-router';
import {
  Screen, 
} from '../Screen';

export {GoalScreen};

class GoalScreen extends Screen{
  handleAnswerSelect = selectedGoal => {
    let selectedAnswers = this.props.selectedAnswers;
    selectedAnswers[this.props.qnNum] = [selectedGoal];

    // Store selectedAnswers to sessionStorage and the state
    sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));

    if (selectedGoal === 0){ // next role
      route("/test/nextrole")
    }
    else if (selectedGoal === 1){ // current role
      route("/test/diag")
    }
  }

  render(){
    return (
      <div className="pure-g">
        <div className="pure-u-1">
					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleAnswerSelect={this.handleAnswerSelect}
						qnData={this.props.qnData} 
					/>
				</div>
      </div>
    );
  }
}
