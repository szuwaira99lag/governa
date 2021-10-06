import { useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  ContentSwitcher,
  GU,
  TextInput,
  IconDown,
  Button,
  IconDownload,
  useToast,
} from '@aragon/ui';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useWallet } from 'providers/AugmentedWallet';

import Transfer from './components/Transfer/Transfer';
import SelectToken from './components/SelectToken/SelectToken';

type props = {
  next: () => void;
  setFormInfo: (value: any) => void;
};

type DepositFormData = {
  token: any;
  depositAmount: string;
  reference?: string;
};

const HeaderContainer = styled.div`
  display: flex;
  padding-bottom: 10px;
  margin-bottom: ${3 * GU}px;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.p`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
`;

const SubTitle = styled.p`
  font-weight: 600;
  font-size: 16px;
  line-height: 125%;
  margin: 4px 0px;
`;

const Description = styled.p`
  color: #7483ab;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
`;

// const SelectorContainer = styled.div`
//   display: flex;
//   width: 100%;
//   height: 44px;
//   background: #ffffff;
//   margin-top: ${GU}px;
//   margin-bottom: ${3 * GU}px;
//   border-radius: 12px;
//   padding: 4px;
// `;

// const Option = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 50%;
//   background: #ffffff;
//   border-radius: 12px;
//   font-weight: 600;
//   color: #7483ab;
//   cursor: pointer;
//   &.active {
//     background: #f0fbff;
//     color: #00c2ff;
//     cursor: auto;
//   }
// `;

const InputContainer = styled.div`
  margin-top: ${GU}px;
  margin-bottom: ${3 * GU}px;
`;

const SubmitButton = styled(Button)`
  height: 48px;
  width: 100%;
  box-shadow: none;

  & p {
    font-weight: 600;
    font-size: 16px;
    margin-right: 12px;
  }
`;

const CustomeContentSwitcher = styled(ContentSwitcher)`
  & > div > ul {
    width: 100%;
  }
  & > div > ul > li {
    width: 100%;
  }
  & > div > ul > li > button {
    width: 50%;
  }
`;

const NewTransfer: React.FC<props> = ({ next, setFormInfo }) => {
  const [selected, setSelected] = useState<number>();
  const [showSelectToken, setShowSelectToken] = useState(false);
  const methods = useForm<DepositFormData>();
  const { control, handleSubmit, watch, getValues } = methods;
  const context: any = useWallet();

  const buildActions = useCallback(async () => {
    const { token, depositAmount, reference = '' } = getValues();
    setFormInfo({ token, depositAmount, reference });
  }, [getValues, setFormInfo]);

  return (
    <FormProvider {...methods}>
      {showSelectToken ? (
        <Controller
          name="token"
          control={control}
          defaultValue={null}
          render={({ field: { onChange } }) => (
            <SelectToken
              setShowSelectToken={() => setShowSelectToken(false)}
              onSelectToken={(value) => {
                setShowSelectToken(false);
                onChange(value);
              }}
            />
          )}
        />
      ) : (
        <Transfer
          methods={methods}
          next={next}
          buildActions={buildActions}
          setShowSelectToken={() => setShowSelectToken(true)}
        />
      )}
    </FormProvider>
  );
};

export default NewTransfer;
