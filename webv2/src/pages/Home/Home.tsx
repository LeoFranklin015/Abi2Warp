import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { Transaction } from './Transaction';

export const Home = () => {
  return (
    <AuthRedirectWrapper requireAuth={false}>
      <PageWrapper>
        <div className='flex flex-col-reverse sm:flex-row items-center h-full w-full'>
          <div className='flex items-start sm:items-center h-full sm:w-1/2 sm:bg-center'>
            <div className='flex flex-col gap-2 max-w-[70sch] text-center sm:text-left text-xl font-medium md:text-2xl lg:text-3xl'>
              <div>
                <h1>Abi2Warp</h1>
                <p className='text-gray-400'>
                  A specialized tool for converting{' '}
                  <a
                    href=''
                    target='_blank'
                    className='text-gray-400 underline decoration-dotted hover:decoration-solid'
                  >
                    ABIs
                  </a>{' '}
                  to{' '}
                  <a
                    href='https://docs.multiversx.com/developers/warp/'
                    target='_blank'
                    className='text-gray-400 underline decoration-dotted hover:decoration-solid'
                  >
                    Warp
                  </a>{' '}
                  format <br className='hidden xl:block' />
                  Upload - Create - Publish your ABI as Warp on
                  <br />
                  <a
                    href='https://multiversx.com/'
                    target='_blank'
                    className='text-gray-400 underline decoration-dotted hover:decoration-solid'
                  >
                    MultiversX
                  </a>{' '}
                  blockchain.
                </p>
              </div>
              <a
                href='/unlock'
                className='self-start inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 bg-transparent hover:bg-blue-600 text-blue-600 hover:text-white mr-0 border-solid border-blue-600 border-[1px]'
              >
                Create Warp
              </a>
            </div>
          </div>
          <div className='h-4/6 bg-mvx-white bg-contain bg-no-repeat w-1/2 bg-center' />
        </div>
      </PageWrapper>
    </AuthRedirectWrapper>
  );
};
