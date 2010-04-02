CC = gcc
OS := $(shell sh -c 'uname')

ifeq ($(OS), Darwin)
	LDFLAGS = -L/usr/local/lib -lSDLmain -lSDL -Wl,-framework,Cocoa
endif
ifeq ($(OS), Linux)
	LDFLAGS = -lSDL
endif

nego : nego.o

nego.o : nego.c
	$(CC) $(LDFLAGS) -c nego.c -o nego.o

clean:
	rm *.o nego

