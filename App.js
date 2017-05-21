import React from 'react';
import { StyleSheet, Text, ListView, View, TextInput, Button } from 'react-native';
import _ from 'lodash';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.ds.cloneWithRows([]),
      searchText: '',
      status: '',
      isLoading: false,
    };

    this.onSearch = this.onSearch.bind(this);
  }

  onSearch(){
    this.setState({isLoading: true});

    return fetch(this.getIssuesUrl())
      .then((response) => {
        let issues = [];
        let status = '';

        if (!response.ok){
          issues = [];
          status = 'Invalid Repository Name.';
          error = true;
        } else {
          data = _.cloneDeep(JSON.parse(response._bodyText));
          issues = _.map(data, (issue) => {
            return {
              id: issue.id,
              title: issue.title,
              author: issue.user.login,
              date: issue.created_at,
              state: issue.state,
            };
          });
          status = `${data.length} issues found.`;
          error = false;
        }

        this.setState({
          dataSource: this.ds.cloneWithRows(issues),
          status,
          error,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({status: 'Something went wrong. Please retry.'});
      });
  }

  getIssuesUrl(){
    return `https://api.github.com/repos/${this.state.searchText}/issues`;
  }

  isButtonDisabled(){
    return this.state.searchText === '' || this.state.isLoading;
  }

  render() {
    return (
      <View style={{flex: 1, paddingTop: 22, paddingBottom: 60}}>
        <View><Text style={styles.heading}>GitHub Issue Fetcher</Text></View>
        <View>
          <Text>Enter GitHub Repo name:</Text>
          <TextInput
            style={styles.searchBox}
            underlineColorAndroid='transparent'
            onChangeText={(searchText) => this.setState({searchText: _.trim(searchText)})}
            value={this.state.searchText}
          />
          <Button
            onPress={this.onSearch}
            title={this.state.isLoading ? "Getting Issues..." : "Get Issues"}
            style={styles.searchButton}
            disabled={this.isButtonDisabled()}
            accessibilityLabel="Get all isssues of the specified github repos."
          />
        </View>
        
        <View>
          {
            !_.isEmpty(this.state.status) &&
              <Text style={this.state.error ? styles.errorStatus : styles.successStatus}>
                {this.state.status}
              </Text>
          }
          <ListView
            style={styles.issuesList}
            enableEmptySections
            dataSource={this.state.dataSource}
            renderRow={(rowData) => <GitHubIssue issue={rowData} key={rowData.id} />}
          />
        </View>
      </View>
    );
  }
}

const GitHubIssue = ({issue}) => (
  <View style={styles.issueContainer}>
    <Text style={styles.issueTitle}>Title: {issue.title}</Text>
    <Text style={styles.issueState}>State: {issue.state}</Text>
    <View>
      <Text>Author: {issue.author}</Text>
      <Text>Date: {issue.date}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  searchBox: {
    height: 40,
    borderColor: 'gray',
    margin: 2,
    marginBottom: 5,
    borderWidth: 1,
    paddingLeft: 2,
  },
  issuesList: {
    marginTop: 5,
  },
  successStatus: {
    color: 'green',
    textAlign: 'center',
    fontSize: 11,
  },
  errorStatus: {
    color: 'red',
    textAlign: 'center',
    fontSize: 11,
  },
  searchButton: {
    color: '#841584',
  },
  issueTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  issueState: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  issueContainer: {
    borderWidth: 1,
    padding: 2,
    marginBottom: 5,
  }
});
