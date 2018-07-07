### Примеры:

1) Отправка одиночной валидной транзакции в произвольную ноду. 
`tx send 210000 10 48559010F59635241BBC8130BC8CF2D58D011987327D0669F76E0E0E8F58DDA4 0x1fed25aa5311d770f29e22870cdb9e715052fea7 1 https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst`
2) Несколько адресов отправляют транзакцию одновременно на один адрес через одну ноду.  
`tx sendFromMul 21000 10 0x1fed25aa5311d770f29e22870cdb9e715052fea7 1 https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst 48559010F59635241BBC8130BC8CF2D58D011987327D0669F76E0E0E8F58DDA4, 7D0AA063D29AB020B7D35B4B784BA2290D8D69E6107B22006AE54E6A225F3947, 9DF1B091B86983EBBFAEE3613BFABF26AA873D82485C3ECE4E95BC39713D8C45, 3819A62AA05D904A6B49FCDC438EB731B93DEE0DE6916009D94E7C9EF39B74A7, 4F92CF924D56EE8D11110A443EE42FD5546DA33E35DCA9A29EECC77DB350186A`
3) Один адрес оптравляет отправляет идентичные транзы через разные ноды.  
`tx sendToMulNodes 100000 1 48559010F59635241BBC8130BC8CF2D58D011987327D0669F76E0E0E8F58DDA4 0x1fed25aa5311d770f29e22870cdb9e715052fea7 1 https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst https://api.myetherapi.com/rop`
4) Много адресов оптравляет отправляет транзы через разные ноды.  
`tx sendFromMultToMultNodesDiff 21000 10 0x1fed25aa5311d770f29e22870cdb9e715052fea7 1 48559010F59635241BBC8130BC8CF2D58D011987327D0669F76E0E0E8F58DDA4_https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst 7D0AA063D29AB020B7D35B4B784BA2290D8D69E6107B22006AE54E6A225F3947_https://api.myetherapi.com/rop`

### Installation
- npm i
- npm i -g

### Misc
Данные по газу берутся с **ethgasstation.info** поле Max Gas Price (Gwei)
