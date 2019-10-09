import DropdownAlert from 'react-native-dropdownalert';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  SubmitButton,
  Input,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  DeleteButton,
  Buttons,
  View,
} from './styles';

export default class Main extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
  };

  async componentDidMount() {
    this.load();
  }

  load = async () => {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
      return;
    }

    this.setState({ users: [] });
  };

  async componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    const { users, newUser } = this.state;

    this.setState({ loading: true });

    try {
      const response = await api.get(`/users/${newUser}`);

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };

      this.setState({
        users: [data, ...users],
        newUser: '',
        loading: false,
      });
    } catch (error) {
      this.dropDownAlertRef.alertWithType('error', 'Erro', error.message);
      console.tron.log(error);

      this.setState({
        newUser: '',
        loading: false,
      });

      this.load();
    }

    Keyboard.dismiss();
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  handleDelete = async user => {
    try {
      let usersJSON = await AsyncStorage.getItem('users');

      let usersArray = JSON.parse(usersJSON);

      const alteredUsers = usersArray.filter(function(e) {
        return e.login !== user.login;
      });

      AsyncStorage.setItem('users', JSON.stringify(alteredUsers));

      this.load();
    } catch (error) {
      this.dropDownAlertRef.alertWithType('error', 'Error', error.message);
      console.tron.log(error);
    }
  };

  static navigationOptions = {
    title: 'Usuários',
  };

  render() {
    const { users, newUser, loading } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
          <DropdownAlert ref={ref => (this.dropDownAlertRef = ref)} />
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.Name}</Name>
              <Bio>{item.bio}</Bio>
              <Buttons>
                <ProfileButton onPress={() => this.handleNavigate(item)}>
                  <ProfileButtonText>Ver Perfil</ProfileButtonText>
                </ProfileButton>
                <DeleteButton onPress={() => this.handleDelete(item)}>
                  <ProfileButtonText>Remover Perfil</ProfileButtonText>
                </DeleteButton>
              </Buttons>
            </User>
          )}
        />
      </Container>
    );
  }
}
