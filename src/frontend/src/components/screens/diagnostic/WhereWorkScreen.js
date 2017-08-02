import { h, Component } from 'preact';
import Question from '../../Question';
import {
  Screen, 
} from '../Screen';

export {WhereWorkScreen};

class WhereWorkScreen extends Screen{
  render() {
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
