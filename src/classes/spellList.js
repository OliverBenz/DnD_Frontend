'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { Card } from 'react-native-elements';

import Search from '../components/search';
import { getData } from '../services/asyStorage';

type Props = {};

export default class SpellList extends Component<Props>{
  static navigationOptions = ({navigation}) => {
    return{
      title: navigation.getParam('title')
    }
  };

  constructor(props){
    super(props);

    this.state = {
      spellList: [],
      search: "",

      spellsPerPage: 20,
      page: 0,

      isLoading: false
    }
  }

  componentDidMount(){
    this.setState({isLoading: true});
    this._getSpellList(this.props.navigation.state.params.url + "/" + parseInt(this.state.page * this.state.spellsPerPage) + "/" + parseInt(this.state.spellsPerPage));
  }

  _inspectSpell = (id) => {
    let spell = this.state.spellList[this.state.spellList.findIndex(x => x.id === id)];
    this.props.navigation.navigate('SpellSpecific', { spell: spell });
  };

  render(){
    if(this.state.isLoading){
      // TODO: Center indivator to center of screen
      return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
         <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    return(
      <ScrollView style={{flex: 1}}>
        <Search value={this.state.search} placeholder="Search..." onChange={(e) => this.setState({search: e})} onClear={() => this._clearFilter()} onConfirm={() => this._getSpellList(this.props.navigation.state.params.url + "/" + parseInt(this.state.page * this.state.spellsPerPage) + "/" + parseInt(this.state.spellsPerPage) + "/" + this.state.search)} />

        { this.state.spellList.map(s => ( this._renderElement(s) )) }

        { this._renderButtons() }
      </ScrollView>
    );
  }

  _renderElement = (s) => {
    return (
      <TouchableOpacity key={s.id} style={{marginBottom: 10}} onPress={() => this._inspectSpell(s.id)} >
        <Card style={{flexDirection: 'row'}} title={s.name}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.text}>Level: { s.level }</Text>
            <Text style={styles.text}>Range: { s.range }</Text>
          </View>
        </Card>
      </TouchableOpacity>
    )
  }

  _renderButtons = () => {
    if(this.state.page === 0){
      return(
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 2}}></View>

          <TouchableOpacity style={styles.button} onPress={()=> this._nextPage()}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      )
    }
    else{
      return(
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.button} onPress={()=> this._prevPage()}>
            <Text>Back</Text>
          </TouchableOpacity>

          <View style={{flex: 1}}></View>

          <TouchableOpacity style={styles.button} onPress={()=> this._nextPage()}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  _clearFilter = () => {
    this.setState({ search: "" });
    this._getSpellList(this.props.navigation.state.params.url + "/" + parseInt(this.state.page * this.state.spellsPerPage) + "/" + parseInt(this.state.spellsPerPage));
  }

  _prevPage = () => {
    if(this.state.page > 0){
      this._getSpellList(this.props.navigation.state.params.url + "/" + parseInt((this.state.page - 1) * this.state.spellsPerPage) + "/" + parseInt(this.state.spellsPerPage));
      this.setState({ page: this.state.page - 1 });
    }
  }
  _nextPage = () => {
    this._getSpellList(this.props.navigation.state.params.url + "/" + parseInt((this.state.page + 1) * this.state.spellsPerPage) + "/" + parseInt(this.state.spellsPerPage));
    this.setState({ page: this.state.page + 1 });
  }

  // Data fetching
  _getSpellList = async (url) => {
    const authKey = await getData("authKey");
    const header = authKey === undefined ? {'Content-Type': 'application/json'} : {'Content-Type': 'application/json', 'Authorization': `Basic ${authKey}`};
    
    fetch(url, {
      method: 'GET',
      headers: header
    })
    .then((res) => res.json())
    .then((resJ) => {
      var spellList = resJ.data;

      this.setState({ spellList: spellList, isLoading: false, page: 0 });
    });
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center'
  },
  button: {
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#A9A9A9',
    margin: 10,
    flex: 1
  }
});