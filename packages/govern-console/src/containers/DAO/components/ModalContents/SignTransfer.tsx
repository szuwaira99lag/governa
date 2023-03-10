import {
  GU,
  LoadingRing,
  IconError,
  IconCheck,
  Button,
  IconRotateLeft,
  IconExternal,
} from '@aragon/ui';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { useFormContext } from 'react-hook-form';
import { Proposal, ReceiptType } from '@aragon/govern';
import { useCallback, useEffect, useState, useMemo } from 'react';

import { useWallet } from 'providers/AugmentedWallet';
import { useTransferContext } from './TransferContext';
import { proposalDetailsUrl } from 'utils/urls';
import { MAINNET_ETHERSCAN_TRANSACTION, RINKEBY_ETHERSCAN_TRANSACTION } from 'utils/constants';
import { CustomTransaction, CustomTransactionStatus } from 'utils/types';

enum SigningState {
  Processing,
  Success,
  Failure,
}

const SignDeposit: React.FC = () => {
  const history = useHistory();
  const { daoIdentifier } = useTransferContext();

  const { getValues } = useFormContext();
  const { networkName } = useWallet();
  const [txState, setTxState] = useState(SigningState.Processing);
  const { transactions, setCancellable } = useTransferContext();
  const [transactionList, setTransactionList] = useState<CustomTransaction[]>([...transactions]);
  const [transactionHash, setTransactionHash] = useState('');

  // Redirect on container hash
  const [containerHash, setContainerHash] = useState<string>();

  const {
    reference,
    title,
    amount,
    token: { symbol },
  } = useMemo(() => getValues(), [getValues]);

  const transferSymbol = useMemo(() => (title === 'Withdraw' ? '-' : '+'), [title]);

  useEffect(() => {
    BuildTransaction();

    // Purposefully want this to run only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = useCallback(
    (txIndex: number, newStatus: CustomTransactionStatus) => {
      const txs = [...transactions];
      txs[txIndex].status = newStatus;
      setTransactionList(txs);
    },
    [transactions],
  );

  const handleViewProposal = useCallback(() => {
    if (containerHash) {
      history.push(proposalDetailsUrl(daoIdentifier, containerHash));
    } else {
      // TODO: implement a solution without full page reload
      window.location.reload();
    }
  }, [containerHash, daoIdentifier, history]);

  const SendToExplore = useCallback(() => {
    window.open(
      `${
        {
          Rinkeby: RINKEBY_ETHERSCAN_TRANSACTION,
          Mainnet: MAINNET_ETHERSCAN_TRANSACTION,
        }[networkName] + transactionHash
      }`,
      '_blank',
    );
  }, [networkName, transactionHash]);

  const BuildTransaction = useCallback(async () => {
    let isQueueAborted = false;
    let index = 0;
    for (const tx of transactionList) {
      // if a transaction was successful, don't re-run it
      if (tx.status === CustomTransactionStatus.Successful) continue;

      if (isQueueAborted) return;
      try {
        setCancellable(false);
        setTransactionHash('');
        setTxState(SigningState.Processing);
        updateStatus(index, CustomTransactionStatus.InProgress);
        const txResponse = await tx.tx();
        const txReceipt = await txResponse.wait();
        updateStatus(index, CustomTransactionStatus.Successful);
        setContainerHash(Proposal.getContainerHashFromReceipt(txReceipt, ReceiptType.Scheduled));
        setTransactionHash(txReceipt.transactionHash);
      } catch (ex: any) {
        isQueueAborted = true;
        updateStatus(index, CustomTransactionStatus.Failed);
        setTxState(SigningState.Failure);
        setCancellable(true);
      }
      index++;
    }
    // All transactions complete
    if (!isQueueAborted) {
      setTxState(SigningState.Success);
      setCancellable(true);
    }
  }, [setCancellable, transactionList, updateStatus]);

  const MessageType = useMemo(() => {
    switch (txState) {
      case SigningState.Processing:
        return (
          <SignCard className="loading">
            <Wrapper>
              <InfoWrapper>
                <LoadingContainer className="loading">
                  <LoadingRing />
                </LoadingContainer>
                <InfoContainer>
                  <InfoTitle>{reference}</InfoTitle>
                  <InfoDescription>Waiting for confirmation ...</InfoDescription>
                </InfoContainer>
              </InfoWrapper>
              <Amount>
                {transferSymbol} {amount} {symbol}
              </Amount>
            </Wrapper>
          </SignCard>
        );
      case SigningState.Success:
        return (
          <SignCard className="success">
            <Wrapper>
              <InfoWrapper>
                <LoadingContainer className="success">
                  <IconCheck />
                </LoadingContainer>
                <InfoContainer>
                  <InfoTitle>{reference}</InfoTitle>
                  <InfoDescription>Transfer successfully confirmed</InfoDescription>
                </InfoContainer>
              </InfoWrapper>
              <Amount>
                {transferSymbol} {amount} {symbol}
              </Amount>
            </Wrapper>
            <SuccessButton
              wide
              label={title === 'Withdraw' ? 'View scheduled action' : 'Close deposit'}
              onClick={handleViewProposal}
            />
            <TransparentButton onClick={SendToExplore} wide>
              <p>View on explorer</p>
              <IconExternal />
            </TransparentButton>
          </SignCard>
        );
      case SigningState.Failure:
        return (
          <SignCard className="failed">
            <Wrapper>
              <InfoWrapper>
                <LoadingContainer className="failed">
                  <IconError />
                </LoadingContainer>
                <InfoContainer>
                  <InfoTitle>{reference}</InfoTitle>
                  <InfoDescription>Transfer rejected by wallet</InfoDescription>
                </InfoContainer>
              </InfoWrapper>
              <Amount>
                {transferSymbol} {amount} {symbol}
              </Amount>
            </Wrapper>
            <FailedButton wide onClick={BuildTransaction}>
              <p>try again</p>
              <IconRotateLeft />
            </FailedButton>
          </SignCard>
        );
    }
  }, [
    txState,
    reference,
    transferSymbol,
    amount,
    symbol,
    title,
    handleViewProposal,
    SendToExplore,
    BuildTransaction,
  ]);

  return (
    <>
      <HeaderContainer>
        <Title>Confirm {title}</Title>
        <Description>To complete your transfer, confirm your {title} with your wallet.</Description>
      </HeaderContainer>
      {MessageType}
    </>
  );
};

export default SignDeposit;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${3 * GU}px;
`;

const Title = styled.p`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const Description = styled.p`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #7483ab;
`;

const SignCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: solid 2px #00c2ff;

  &.loading {
    border: solid 2px #00c2ff;
  }
  &.success {
    border: solid 2px #3cce6e;
  }
  &.failed {
    border: solid 2px #ff575c;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  border-radius: 8px;

  &.loading {
    background: #f0fbff;
  }
  &.success {
    background: #effbf3;
    color: #3cce6e;
  }
  &.failed {
    background: #ffe0e1;
    color: #ff575c;
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
}
`;

const InfoWrapper = styled.div`
  display: flex;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${2 * GU}px;
`;

const InfoTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
`;

const InfoDescription = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 150%;
  color: #7483ab;
`;

const Amount = styled.p`
  display: flex;
  font-size: 16px;
  font-weight: 600;
  color: #20232c;
`;

const SuccessButton = styled(Button)`
  background: #effbf3;
  color: #3cce6e;
  box-shadow: none;
  margin-top: 16px;
  height: 40px;

  &:hover {
    background: #effbf3;
  }
`;

const FailedButton = styled(Button)`
  background: #ffe0e1;
  color: #ff575c;
  box-shadow: none;
  margin-top: 16px;
  height: 40px;
  &:hover {
    background: #ffe0e1;
  }
`;

const TransparentButton = styled(Button)`
  background: transparent;
  color: #00c2ff;
  margin-top: 16px;
  height: 40px;
  box-shadow: none;
  &:hover {
    background: transparent;
  }
`;
