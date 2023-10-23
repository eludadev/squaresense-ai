'use client';

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarSeparator,
} from '@/components/ui/menubar';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { useSWRConfig } from 'swr';
import { useToast } from '@/components/ui/use-toast';
import MerchantProfile from './merchant-profile';
import AppLogotype from '@/vectors/logotype';

export function AppMenu() {
  const { toast } = useToast();

  const { theme, setTheme } = useTheme();
  const { mutate } = useSWRConfig();

  const { replace } = useRouter();
  const [_, __, deleteCookie] = useCookies(['square_access_token']);

  function logout() {
    toast({
      title: 'Logging out...',
      description: 'This might take a moment.',
    });

    mutate(() => true, undefined, { revalidate: false });

    deleteCookie('square_access_token');
    replace('/auth');

    if (typeof window !== 'undefined') localStorage.clear();
  }

  return (
    <Menubar className="flex justify-between items-start z-20 rounded-none border-b border-none px-2 lg:px-4 mx-2 sticky top-0 pb-4 pt-2 h-16 shadow-sm">
      <MenubarMenu>
        <MenubarTrigger className="font-bold">
          <AppLogotype />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Theme</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup
                value={theme ?? 'system'}
                onValueChange={(value) => setTheme(value)}
              >
                <MenubarRadioItem value="light">Light</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
                <MenubarRadioItem value="system">System</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Send Feedback</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          <MerchantProfile />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={logout}>Logout</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
