//gcc `pkg-config --cflags --libs webkit-1.0` baad.c

#include <gtk/gtk.h>
#include <webkit/webkit.h>

static void destroy_cb(GtkWidget* widget, gpointer data) {gtk_main_quit();}

int main(int argc, char* argv[]){
	gtk_init(&argc, &argv);

	GtkWidget *window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
	GtkWidget *scrolled_window = gtk_scrolled_window_new (NULL, NULL);
	GtkWidget *text_view = gtk_text_view_new();
	GtkTextBuffer *buffer = gtk_text_view_get_buffer(GTK_TEXT_VIEW(text_view));

	GdkScreen *screen = gtk_widget_get_screen(window);
	GdkColormap *rgba = gdk_screen_get_rgba_colormap(screen);
	WebKitWebView *web_view = WEBKIT_WEB_VIEW(webkit_web_view_new());

	// Web view transparency if available
	if (rgba && gdk_screen_is_composited (screen)) {
		gtk_widget_set_default_colormap(rgba);
		gtk_widget_set_colormap(GTK_WIDGET(window), rgba);
	}
	webkit_web_view_set_transparent(web_view, TRUE);
	webkit_web_view_load_uri(web_view, "http://localhost/");

	gtk_container_add(GTK_CONTAINER(scrolled_window), GTK_WIDGET(web_view));
	gtk_container_add(GTK_CONTAINER(window), scrolled_window);
	gtk_window_set_default_size(GTK_WINDOW(window), 200, 200);
	gtk_widget_show_all(window);
	// gtk_widget_grab_focus(GTK_WIDGET(web_view));

	g_signal_connect(window, "destroy", G_CALLBACK(destroy_cb), NULL);
	gtk_main();
	return 0;
}
