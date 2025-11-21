from django.db import models

class Dua(models.Model):
    title = models.CharField(max_length=255)
    text = models.TextField()
    source = models.URLField()
    tags = models.ManyToManyField('Tag', blank=True)

    def __str__(self):
        return self.title
    

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)


    def __str__(self):
        return self.name


class Translation(models.Model):
    dua = models.ForeignKey(Dua, related_name='translations', on_delete=models.CASCADE)
    language = models.CharField(max_length=50, choices=[('en', 'English'), ('ur', 'Urdu')])
    text = models.TextField()

    def __str__(self):
        return f"{self.language} translation of {self.dua.title}"