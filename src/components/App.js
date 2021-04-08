import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import LogItem from './LogItem';
import AddLogItem from './AddLogItem';
import { ipcRenderer } from 'electron';

const App = () => {
  const [logs, setLogs] = useState([]);

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'success',
  });

  useEffect(() => {
    ipcRenderer.send('logs:load');
    ipcRenderer.on('logs:get', (e, logs) => {
      setLogs(JSON.parse(logs));
    });
  }, []);

  function addItem(item) {
    if (
      item.text.trim() === '' ||
      item.user.trim() === '' ||
      item.priority === '0'
    ) {
      showAlert('Please enter all fields', 'danger');
      return;
    }
    ipcRenderer.send('logs:add', JSON.stringify(item));
    ipcRenderer.on('logs:get', (e, logs) => {
      setLogs(JSON.parse(logs));
      showAlert('Log Added');
    });
    // item._id = Math.floor(Math.random() * 9000) + 1000;
    // item.created = new Date().toString();
    // setLogs((prevLogs) => [...prevLogs, item]);
  }

  function deleteItem(_id) {
    // setLogs((prevLogs) => prevLogs.filter((log) => log._id !== _id));
    ipcRenderer.send('logs:delete', _id);
    ipcRenderer.on('logs:get', (e, logs) => {
      setLogs(JSON.parse(logs));
      showAlert('Log Deleted');
    });
  }

  function showAlert(message, variant = 'success', seconds = 3000) {
    setAlert({
      show: true,
      message,
      variant,
    });
    setTimeout(() => {
      setAlert({
        show: false,
        message: '',
        variant: 'success',
      });
    }, seconds);
  }

  return (
    <Container>
      <AddLogItem addItem={addItem} />
      {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
      <Table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Log Text</th>
            <th>User</th>
            <th>Created date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <LogItem key={log._id} log={log} deleteItem={deleteItem}></LogItem>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default App;
