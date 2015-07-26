from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

@register.filter(name='cut')
@stringfilter
def cut(value, arg):
    """Removes all values of arg from the given string"""
    return value.replace(arg, '')

@register.filter(name='lower')
@stringfilter
def lower(value): # Only one argument.
    """Converts a string into all lowercase"""
    return value.lower()

@register.filter(name='upper')
@stringfilter
def upper(value): # Only one argument.
    """Converts a string into all uppercase"""
    return value.upper()

@register.filter(name='firstname')
@stringfilter
def firstname(value): # Only one argument.
    """Converts name to first name"""
    return value.split()[0]

@register.filter(name='dateonly')
@stringfilter
def dateonly(value): # Only one argument.
    """Converts name to first name"""
    return value.split(",")[0]
