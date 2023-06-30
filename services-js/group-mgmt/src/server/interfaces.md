Group
- dn [x] *renamed distinguishedName
- cn []
- controls [x]
- uniquemember [] *renamed member
- owner [x]
- actualdn [x]
- entrydn [x]
- displayname [x]
- ou [x]
- objectclass []

  Group - New Server
  - distinguishedName []
  - member


  Group
  - cn
  - description
  - member
  - distinnguishedName
  - sAMAccountName
  - objectClass    

Person
- dn [x] *renamed distinguishedName
- cn []
- controls [x]
- ismemberof [x] *renamed memberOf
- sn [x]
- givenname [x]
- displayname [x]
- uid [x]
- inactive [x]
- nsaccountlock [x]
- objectclass []

  Person - New Server
  - name []
  - sAMAccountName []
  - sAMAAccountType []
  - memberOf []








  <!-- Pruned 0 symbolic links and 7 directories from /opt/homebrew
  ==> Caveats
  ==> openjdk
  For the system Java wrappers to find this JDK, symlink it with
    sudo ln -sfn /opt/homebrew/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk

  openjdk is keg-only, which means it was not symlinked into /opt/homebrew,
  because macOS provides similar software and installing this software in
  parallel can cause all kinds of trouble.

  If you need to have openjdk first in your PATH, run:
    echo 'export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"' >> ~/.zshrc

  For compilers to find openjdk you may need to set:
    export CPPFLAGS="-I/opt/homebrew/opt/openjdk/include"
  ==> yarn
  yarn requires a Node installation to function. You can install one with:
    brew install node




  phillipkelly@Phillips-M1-MacBook-Pro group-mgmt % brew install apache-directory-studio
  ==> Caveats
  To set the Java VM to use:

    https://directory.apache.org/studio/faqs.html#how-to-set-the-java-vm-to-use

  apache-directory-studio requires Java 11+. You can install the latest version with:
    brew install --cask temurin

  ==> Downloading https://www.apache.org/dyn/closer.cgi?path=/directory/studio/2.0.0.v20210717-M17/ApacheDirectoryStudio-
  ==> Downloading from https://dlcdn.apache.org/directory/studio/2.0.0.v20210717-M17/ApacheDirectoryStudio-2.0.0.v2021071
  ################################################################################################################ 100.0%
  ==> Installing Cask apache-directory-studio
  ==> Moving App 'ApacheDirectoryStudio.app' to '/Applications/ApacheDirectoryStudio.app'
  🍺  apache-directory-studio was successfully installed!


  Navaneeshwar Kanchamreddy1:06 PM
  ldaps://iamdir-test.boston.gov:636/DC=DomainDnsZones,DC=iamdir-test,DC=boston,DC=gov?objectClass??(objectClass=*)
  # command line : ldapsearch -H ldaps://iamdir-test.boston.gov:636 -x -D "svc_groupmgmt" -W -b "DC=DomainDnsZones,DC=iamdir-test,DC=boston,DC=gov" -s base -a always -z 1 "(objectClass=*)" "objectClass"
  Navaneeshwar Kanchamreddy1:55 PM
  iamdir-test.boston.gov
  Navaneeshwar Kanchamreddy1:57 PM
  telenet iamdir-test.boston.gov:636
  telnet iamdir-test.boston.gov:636
  Navaneeshwar Kanchamreddy1:59 PM
  ztvds.cityhall.boston.cob
  Navaneeshwar Kanchamreddy2:00 PM
  10.241.111.31 -->

