import React, {useState, useEffect} from 'react';
import { Alert, Badge, Button, Card, Col, Container, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

let Web3 = require('web3');
var numeral = require('numeral');

function Index() {

  const [hardhatResult, SethardhatResult] = useState('');
  const [messageToContract, SetMessageToContract] = useState('');

  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [ethBalance, setethBalance] = useState(0);
  const [otherBalance, setotherBalance] = useState(0);
  const [networkSelect, setNetwork] = useState(null);

  let testLocal = false;

  let contractAddress = "0x206BF2004c1908f1738705E531Eb6c78e8a3191F";
  let web3Connect = "wss://rinkeby.infura.io/ws/v3/ba1abf23f37241e2896b48adc745f55d";

  var contractJsonHardhat = require('../hardhat_simple_contract/artifacts/contracts/Greeter.sol/Greeter.json');
  let abi = contractJsonHardhat['abi'];

  useEffect(async () => {
    console.log('==========FIRST APP RUN==========');
    await setContractInit()
  }, []);

  async function setContractInit() {
    try{
      window.ethereum ?
        ethereum.request({ method: "eth_requestAccounts" }).then(async (accounts) => {

          if(testLocal){
            accounts[0] = test_WalletAddress;
          }

          console.log('getAccount:', accounts);
          
          setAddress(accounts[0]);
          
          let w3 = await new Web3(web3Connect);
          
          setWeb3(w3);

          let c = new w3.eth.Contract(abi, contractAddress);

          console.log('Contract: ', c._address);
          setContract(c);

          startApp(w3, accounts, c);

        }).catch((err) => console.log(err))
      : console.log("Please install MetaMask")
    }catch(error){
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
      web3.eth.getBalance(accounts[0]).then( (balances) => {
        let bn = web3.utils.fromWei(balances, "ether");
        console.log('getBalance: ', bn);
        setethBalance(Number(bn).toFixed(4));
      });

      c.methods.balanceOf(accounts[0]).call({from: accounts[0]}, function(error, result){

        if(error){
          console.log(error);
        }else{
          let bn = web3.utils.fromWei(result, "ether");
          console.log('getBalance: ' + bn + ' TENT');
          setotherBalance(Number(bn).toFixed(4));
        }
        
      });

      web3.eth.net.getId().then(netId => {

        let network = '';
        let networkDisplay = '';
        let warning = '';
        let explorerUrl = '';

        console.log('netId: ' + netId);

        switch (netId) {
          case 1:
              network = 'Mainnet';
              networkDisplay = network;
              warning = 'please switch your network to Kovan or Thai Chain';
              explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
              break
          case 2:
              network = 'Deprecated Morden';
              networkDisplay = network;
              warning = 'please switch your network to Kovan or Thai Chain';
              explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
              break
          case 3:
              network = 'Ropsten';
              networkDisplay = network;
              warning = 'please switch your network to Kovan or Thai Chain';
              explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
              break
          default:
              network = 'Unknown';
              networkDisplay = network;
              warning = 'please switch your network to Kovan or Thai Chain';
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
                  <b>Token Balance :</b> { otherBalance ? numeral(otherBalance).format('0,0.0000') : '0' } HHT
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
          </Col>
        </Row>
         
      </div>
    </Container>
    </>
    
  )
}

export default Index;