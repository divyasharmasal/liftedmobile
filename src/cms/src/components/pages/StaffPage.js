import { h, Component } from 'preact';

export class StaffPage extends Component {
  render(){
    return(
      <div>
        <h1>Staff</h1>
        <button class="add_staff_button pure-button button-green">
          Add 
        </button>

        <table class="staff_table pure-table">
          <thead>
            <td>Name</td>
            <td>Status</td>
            <td>Edit</td>
            <td>Remove</td>
          </thead>
          <tbody>
            <tr>
              <td>Name 1</td>
              <td>Active</td>
              <td><a href="#">disable</a></td>
              <td><a href="#">remove</a></td>
            </tr>
            <tr>
              <td>Name 2</td>
              <td>Active</td>
              <td><a href="#">disable</a></td>
              <td><a href="#">remove</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

