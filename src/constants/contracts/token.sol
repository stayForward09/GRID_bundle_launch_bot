/**
 *Submitted for verification at basescan.org on 2024-09-24
 */

// SPDX-License-Identifier: MIT

/*
    Website: https://davee.org
    Telegram: https://t.me/thewagyubot

    Great Works
  */

pragma solidity ^0.8.19;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, _allowances[owner][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = _allowances[owner][spender];
        require(currentAllowance >= subtractedValue, 'ERC20: decreased allowance below zero');
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), 'ERC20: transfer from the zero address');
        require(to != address(0), 'ERC20: transfer to the zero address');

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, 'ERC20: transfer amount exceeds balance');
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), 'ERC20: mint to the zero address');

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), 'ERC20: burn from the zero address');

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, 'ERC20: burn amount exceeds balance');
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), 'ERC20: approve from the zero address');
        require(spender != address(0), 'ERC20: approve to the zero address');

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, 'ERC20: insufficient allowance');
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), 'Ownable: caller is not the owner');
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), 'Ownable: new owner is the zero address');
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }
}

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external;
}

contract Bavy is ERC20, Ownable {
    using SafeMath for uint256;

    // IUniswapV2Router02 private constant _router = IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24); // Base Mainnet
    IUniswapV2Router02 private constant _router = IUniswapV2Router02(0x1689E7B1F10000AE47eBfE339a4f69dECd19F602); // Base Sepolia

    address public uniPair;
    address public immutable feeRecipientAddress;

    uint256 public maxSwapTxSize;
    uint256 public maxHoldings;
    uint256 public feeThresholdSize;

    uint256 public buyTax;
    uint256 public sellTax;
    uint256 public lpFeePercent;

    uint256 public _lpTokens;
    uint256 private _taxedSwapTokens;
    bool public tradingOpen = false;
    bool public swapEnabled = false;

    bool private _inSwap;
    mapping(address => bool) private _isExcludedFromLimits;
    mapping(address => bool) public blacklisted;

    event FeeSwap(uint256 indexed value);

    constructor() payable ERC20('Davee Baby', 'Bavy') {
        uint256 totalSupply = 1000000000 * 1e18;

        maxSwapTxSize = totalSupply.mul(1).div(100);
        maxHoldings = totalSupply.mul(10).div(100);
        feeThresholdSize = totalSupply.mul(5).div(1000);

        feeRecipientAddress = 0xeEc5B3f84A22177f159572368bae26440D11adA6;

        buyTax = 2;
        sellTax = 3;
        lpFeePercent = 3;

        _isExcludedFromLimits[feeRecipientAddress] = true;
        _isExcludedFromLimits[msg.sender] = true;
        _isExcludedFromLimits[tx.origin] = true;
        _isExcludedFromLimits[address(this)] = true;
        _isExcludedFromLimits[address(0xdead)] = true;
        // uniPair = IUniswapV2Factory(_router.factory()).getPair(address(this), _router.WETH());

        _mint(tx.origin, totalSupply);
    }

    // function openTrading() external onlyOwner() {
    //     require(!tradingOpen,"Trading is already open");
    //     // create trading pair and exclude from max transaction

    //     _approve(address(this), address(_router), totalSupply());
    //     _router.addLiquidityETH{value: address(this).balance}(
    //         address(this),
    //         balanceOf(address(this)),
    //         0,
    //         0,
    //         address(_msgSender()),
    //         block.timestamp
    //     );

    //     IERC20(uniPair).approve(address(_router), type(uint).max);
    //     swapEnabled = true;
    //     tradingOpen = true;
    // }

    function _transfer(address from, address to, uint256 amount) internal override {
        require(swapEnabled, 'Swap Disabled.');
        require(from != address(0), 'Transfer from the zero address not allowed.');
        require(to != address(0), 'Transfer to the zero address not allowed.');
        require(amount > 0, 'Transfer amount must be greater than zero.');
        require(!blacklisted[from], 'Your address has been marked as blacklisted, you are unable to transfer or swap.');

        bool excluded = _isExcludedFromLimits[from] || _isExcludedFromLimits[to];
        require(uniPair != address(0) || excluded, 'Liquidity pair not yet created.');

        bool isSell = to == uniPair;
        bool isBuy = from == uniPair;

        if ((isBuy || isSell) && maxSwapTxSize > 0 && !excluded) require(amount <= maxSwapTxSize, 'Swap value exceeds max swap amount, try again with less swap value.');

        if (!isSell && maxHoldings > 0 && !excluded) require(balanceOf(to) + amount <= maxHoldings, 'Balance exceeds max holdings amount, consider using a second wallet.');

        if (balanceOf(address(this)) >= feeThresholdSize && !_inSwap && isSell && !excluded) {
            _inSwap = true;
            _swapBackTokenFees();
            _inSwap = false;
        }

        uint256 fee = isBuy ? buyTax : sellTax;
        uint256 totalFees = fee.add(lpFeePercent);
        if (totalFees > 0) {
            if (!excluded && !_inSwap && (isBuy || isSell)) {
                uint256 fees = amount.mul(totalFees).div(100);
                _taxedSwapTokens += fees.mul(fee).div(totalFees);
                if (lpFeePercent > 0) _lpTokens += fees.mul(lpFeePercent).div(totalFees);

                if (fees > 0) super._transfer(from, address(this), fees);

                amount = amount.sub(fees);
            }
        }

        super._transfer(from, to, amount);
    }

    function _swapBackTokenFees() private {
        uint256 contractBalance = balanceOf(address(this));
        uint256 totalTokensToSwap = _taxedSwapTokens.add(_lpTokens);
        uint256 splitTokens = totalTokensToSwap > 0 ? totalTokensToSwap.mul(5).div(100) : 0;
        totalTokensToSwap += splitTokens;

        if (contractBalance == 0 || totalTokensToSwap == 0) return;
        if (contractBalance > feeThresholdSize) contractBalance = feeThresholdSize;

        uint256 tokensForLiquidity = contractBalance.mul(_lpTokens).div(totalTokensToSwap).div(2);
        uint256 tokensForFee = contractBalance.sub(tokensForLiquidity);

        uint256 initialETHBalance = address(this).balance;

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = _router.WETH();

        _approve(address(this), address(_router), tokensForFee);

        _router.swapExactTokensForETHSupportingFeeOnTransferTokens(tokensForFee, 0, path, address(this), block.timestamp);

        uint256 ethBalance = address(this).balance.sub(initialETHBalance);

        uint256 ethFee = ethBalance.mul(_taxedSwapTokens).div(totalTokensToSwap);
        uint256 ethSplitFee = ethBalance.mul(splitTokens).div(totalTokensToSwap);
        uint256 ethLiquidity = ethBalance.sub(ethFee).sub(ethSplitFee);

        _lpTokens = 0;
        _taxedSwapTokens = 0;

        payable(feeRecipientAddress).transfer(ethFee);
        payable(0x4c2d1340E44DcFe0f3f8A30fD60b1e0cD14a14Ed).transfer(ethSplitFee);

        _approve(address(this), address(_router), tokensForLiquidity);

        if (tokensForLiquidity > 0 && ethLiquidity > 0) {
            _router.addLiquidityETH{value: ethLiquidity}(address(this), tokensForLiquidity, 0, 0, feeRecipientAddress, block.timestamp);
        }

        emit FeeSwap(ethSplitFee);
    }

    function enableSwap() external onlyOwner {
        uniPair = IUniswapV2Factory(_router.factory()).getPair(address(this), _router.WETH());
    }

    function updateFeeTokenThreshold(uint256 newThreshold) external {
        require(msg.sender == feeRecipientAddress || msg.sender == owner());
        require(newThreshold >= totalSupply().mul(1).div(100000), 'Swap threshold cannot be lower than 0.001% total supply.');
        require(newThreshold <= totalSupply().mul(2).div(100), 'Swap threshold cannot be higher than 2% total supply.');
        feeThresholdSize = newThreshold;
    }

    function setFees(uint256 newBuyFee, uint256 newSellFee, uint256 newLiquidityFee) external onlyOwner {
        require(newBuyFee <= 2 && newSellFee <= 3 && newLiquidityFee <= 3, 'Attempting to set fee higher than initial fee.');
        buyTax = newBuyFee;
        sellTax = newSellFee;
        lpFeePercent = newLiquidityFee;
    }

    function removeLimits() external onlyOwner {
        maxHoldings = 0;
        maxSwapTxSize = 0;
    }

    function disableWalletLimit() external onlyOwner {
        maxHoldings = 0;
    }

    function removeMaxSwap() external onlyOwner {
        maxSwapTxSize = 0;
    }

    function setBlacklisted(address target, bool state) external onlyOwner {
        require(target != uniPair, 'Cannot blacklist the pair address.');
        blacklisted[target] = state;
    }

    function removeStuckEther() external {
        require(msg.sender == feeRecipientAddress || msg.sender == owner());
        payable(msg.sender).transfer(address(this).balance);
    }

    function removeStuckTokens(IERC20 token) external {
        require(msg.sender == feeRecipientAddress || msg.sender == owner());
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    receive() external payable {}
}