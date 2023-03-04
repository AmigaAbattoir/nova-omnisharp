//
//  main.c
//  UnityNova
//
//  Created by Christopher Pollati on 3/3/23.
//

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, const char * argv[]) {
    char cmd[2048];

/*
    FILE *fp;
    fp = fopen("/Users/abattoir/Desktop/test.log", "w+");
    fprintf(fp, "Testing what Unity is passing us!\n");
    fprintf(fp, "ARGC [[%i]]]\n", argc);
    fprintf(fp, " 1 - [[%s]]]\n", argv[1]);
    fprintf(fp, " 2 - [[%s]]]\n", argv[2]);
    fprintf(fp, " 3 - [[%s]]]\n", argv[3]);
*/

    /* Since Nova does not handle 0 for line or column, in order to make sure we can have Unity pass those
     * all the time, we will have to change what is passed to the "nova" command to open the right way
     */
    if(!strcmp(argv[2],"0")) {
        sprintf(cmd, "/usr/local/bin/nova open \"%s\"\n", argv[1]);
    } else if(!strcmp(argv[3],"0")) {
        sprintf(cmd, "/usr/local/bin/nova open \"%s\" -l %s\n", argv[1], argv[2]);
    } else {
        sprintf(cmd, "/usr/local/bin/nova open \"%s\" -l %s:%s\n", argv[1], argv[2], argv[3]);
    }

/*
    fprintf(fp, " Going to issue Command -[[%s]]\n", cmd);
    fclose(fp);
*/

    system(cmd);
    return 0;
}
