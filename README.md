### Примеры:

1) Отправка одиночной валидной транзакции в произвольную ноду. 
`tx send 0xCEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092 0x1fed25aa5311d770f29e22870cdb9e715052fea7 1 https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst`
2) 5-10 адресов  отправлеют транзакцию одновременно на один адрес через одну ноду.  
`tx sendFromMul 0x1fed25aa5311d770f29e22870cdb9e715052fea7 1 https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst 0xCEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092, 0x7D0AA063D29AB020B7D35B4B784BA2290D8D69E6107B22006AE54E6A225F3947`
3) Один адрес оптравляет отправляет идентичные транзы через разные ноды.  
`tx sendToMulNodes 0xCEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092 0x1fed25aa5311d770f29e22870cdb9e715052fea7 1 https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst http://network.crycoin.net:8547`


### Installation
- npm i
- npm i -g
