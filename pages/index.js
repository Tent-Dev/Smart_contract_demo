import React, {useState, useEffect} from 'react';
import { Alert, Badge, Button, Card, Col, Container, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

let Web3 = require('web3');
var numeral = require('numeral');

function Index() {

  const [hardhatResult, SethardhatResult] = useState('');
  const [messageToContract, SetMessageToContract] = useState('');

  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [ethBalance, setethBalance] = useState(0);
  const [otherBalance, setotherBalance] = useState(0);
  const [networkSelect, setNetwork] = useState(null);

  const [receiverAddress, setReceiverAddress] = useState(null);
  const [transferAmount, setTransferAmount] = useState(0);

  let contractAddress = "0x6B4354492C9093fC1E7Ef5C68B751C15e0051e90";
  let web3Connect = "wss://rinkeby.infura.io/ws/v3/ba1abf23f37241e2896b48adc745f55d";

  var contractJsonHardhat = require('../hardhat_simple_contract/artifacts/contracts/Greeter.sol/Greeter.json');
  let abi = contractJsonHardhat['abi'];

  useEffect(async () => {
    console.log('==========FIRST APP RUN==========');
    await setContractInit()
  }, []);

  async function setContractInit() {
    try{
      //Call MetaMask from browser's window
      window.ethereum ?
        ethereum.request({ method: "eth_requestAccounts" }).then(async (accounts) => {

          // Call Web3
          let w3 = await new Web3(web3Connect);

          //Contract Object
          let c = new w3.eth.Contract(abi, contractAddress);

          console.log('getAccount:', accounts);
          console.log('Contract: ', c._address);

          //set State (Address and Contract)
          setAddress(accounts[0]);
          setContract(c);

          startApp(w3, accounts, c);

        }).catch((err) => console.log(err))
      : console.log("Please install MetaMask")
    }
    catch(error){
      console.log('START ERROR: ' + error);
    }

    ethereum.on('accountsChanged', (accounts) => {
      console.log('Account Changed');
      window.location.reload();
    });
  };

  function startApp(web3, accounts, c) {
    console.log('Start App');
    console.log('Data: ', web3, accounts[0], c);


    try{
      //Get ETH balance
      web3.eth.getBalance(accounts[0]).then( (balances) => {
        let bn = web3.utils.fromWei(balances, "ether");
        console.log('getBalance: ', bn);
        setethBalance(Number(bn).toFixed(4));
      });

      //Get MyToken balance
      c.methods.balanceOf(accounts[0]).call({from: accounts[0]}, function(error, result){

        if(error){
          console.log(error);
        }else{
          let bn = web3.utils.fromWei(result, "ether");
          console.log('getBalance: ' + bn + ' MKT');
          setotherBalance(Number(bn).toFixed(4));
        }
        
      });

      //Get Network
      web3.eth.net.getId().then(netId => {

        let network = '';
        let networkDisplay = '';

        console.log('netId: ' + netId);

        switch (netId) {
          case 1:
              network = 'Mainnet';
              networkDisplay = network;
              break
          case 2:
              network = 'Deprecated Morden';
              networkDisplay = network;
              break
          case 3:
              network = 'Ropsten';
              networkDisplay = network;
              break
          case 4:
              network = 'Rinkeby';
              networkDisplay = network;
              break
          default:
              network = 'Unknown';
              networkDisplay = network;
        }
        setNetwork(networkDisplay);
        console.log('Network: ', networkDisplay);
      })
    }catch(error){
        console.log('START ERROR : '+error);
    }
  }

  async function greetMe() {
    console.log(contract);
    const greetMsg = await contract.methods.greet().call();
    SethardhatResult(greetMsg);
  }

  async function setGreetMe() {

    const transactionParameters = {
      from: address,
      to: contractAddress,
      data: contract.methods.setGreeting(messageToContract).encodeABI()
    };

    const txHash =  await window.ethereum.request({method: 'eth_sendTransaction', params: [transactionParameters]}).then((result) => {
      console.log('Sending transaction...');
      console.log(result);
    }).catch((error) => {
      console.log('Sending transaction error');
      console.log(error);
    })
  }

  function receiverAddressChange (input) {
    setReceiverAddress(input.target.value);
  }

  function transferAmountChange (input) {
    setTransferAmount(input.target.value);
  }

  async function transferHardhat() {
    try{
      let convertUintTransferAmount = Web3.utils.toWei(transferAmount, "ether");

      console.log('My address: ', address);
      console.log('Transfer to: ', receiverAddress);
      console.log('Amount: ', convertUintTransferAmount);

      //Data object for send transaction
      const transactionParameters = {
        from: address,
        to: contractAddress,
        data: contract.methods.transfer(receiverAddress, convertUintTransferAmount).encodeABI()
      };

      //send transaction
      await window.ethereum.request({method: 'eth_sendTransaction', params: [transactionParameters]}).then((result) => {
        console.log('Sending transaction...');
        console.log(result);
      }).catch((error) => {
        console.log('Sending transaction error');
        console.log(error);
      })
    }
    catch(err){
      console.log(err.message);
    }
  }

  return (
    <>
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
      <Navbar.Brand href="#home">HardHat Token</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav" style={{justifyContent: 'right'}}>
        <Nav>
          <Nav.Link>{address ? address : <div onClick={setContractInit}>Connect Wallet</div>}</Nav.Link>
        </Nav>
      </Navbar.Collapse>
      </Container>
    </Navbar>
    <Container>
      <div style={{textAlign: 'center', marginTop: 20}}>
        <Alert variant='success'>
        <Row>
          <Col>
            <b>Contract address :</b> {contract ? contract['_address'] : 'Not Connect' }
          </Col>
        </Row>
        </Alert>
        <Row>
          <Col>
            <Card >
              <div>
                <div>
                  <b>dApps Network :</b> {networkSelect ? networkSelect : 'Not Connect' }
                </div>
                <div>
                  <b>ETH Balance :</b> { ethBalance ? numeral(ethBalance).format('0,0.0000') : '0' } ETH
                </div>
                <div>
                  <b>Token Balance :</b> { otherBalance ? numeral(otherBalance).format('0,0.0000') : '0' } MKT
                </div>
              </div>
            </Card>
            <Card style={{marginTop: 20}}>
            <Row className="justify-content-md-center">
              <Col md="auto" style={{textAlign: 'left'}}>
                <div style={{marginTop: 20}}>
                  <b>Message :</b> {hardhatResult}
                </div>
              </Col>
            </Row>
              <div style={{marginTop: 10, marginBottom: 20}}>
                <Button onClick={greetMe}>Greet Me!</Button>
              </div>
            </Card>
            <Card style={{marginTop: 20}}>
              <Row className="justify-content-md-center">
                <Col md="auto" style={{textAlign: 'left'}}>
                  <div style={{marginTop: 20}}>
                    <b>Set Message :</b> <input placeholder='Message' value={messageToContract} onChange={e => SetMessageToContract(e.target.value)}></input>
                  </div>
                </Col>
              </Row>
              <div style={{marginTop: 10, marginBottom: 20}}>
                <Button onClick={setGreetMe}>Set Me!</Button>
              </div>
            </Card>
            {/* <Card style={{marginTop: 20}}>
            <Row className="justify-content-md-center">
              <Col md="auto" style={{textAlign: 'left'}}>
                <div style={{marginTop: 20}}>
                  <b>Send to :</b> <input placeholder='Ethereum Address' value={receiverAddress} onChange={receiverAddressChange}></input>
                </div>
                <div style={{marginTop: 20}}>
                  <b>Amount :</b> <input placeholder='Amount' value={transferAmount} onChange={transferAmountChange}></input> MKT
                </div>
              </Col>
            </Row>
              <div style={{marginTop: 10, marginBottom: 20}}>
                <Button onClick={transferHardhat}>Send</Button>
              </div>
            </Card> */}
          </Col>
        </Row>
         
      </div>
    </Container>
    </>
    
  )
}

export default Index;