import { h, Component } from 'preact';
import Question from '../../Question';
import { route } from 'preact-router';
import { Screen, } from '../Screen';

export {GoalScreen};

class GoalScreen extends Screen{
  handleOptionSelect = id => {
    this.props.handleOptionSelect(this.props.name, id);
    route(this.props.nextScreenPaths[id]);
  }


  render(){
    return (
      <div className="pure-g">
        <div className="pure-u-1">
          {this.renderStartOver()}
					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleOptionSelect={this.handleOptionSelect}
						qnData={this.props.qnData} 
					/>
				</div>
      </div>
    );
  }
}
